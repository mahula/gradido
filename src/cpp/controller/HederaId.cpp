#include "HederaId.h"
#include "../SingletonManager/ErrorManager.h"

using namespace Poco::Data::Keywords;

namespace controller {

	HederaId::HederaId(model::table::HederaId* dbModel)
	{
		mDBModel = dbModel;
	}

	HederaId::~HederaId()
	{

	}

	Poco::AutoPtr<HederaId> HederaId::create(Poco::UInt64 shardNum, Poco::UInt64 realmNum, Poco::UInt64 num)
	{
		auto db = new model::table::HederaId(shardNum, realmNum, num);

		auto hedera_id = new HederaId(db);
		return Poco::AutoPtr<HederaId>(hedera_id);
	}

	Poco::AutoPtr<HederaId> HederaId::load(int id)
	{
		auto db = new model::table::HederaId();
		if (1 == db->loadFromDB("id", id)) {
			auto cryptoKey = new HederaId(db);
			return Poco::AutoPtr<HederaId>(cryptoKey);
		}
		return nullptr;
	}

	Poco::AutoPtr<HederaId> HederaId::find(int groupId, model::table::HederaNetworkType networkType)
	{
		auto cm = ConnectionManager::getInstance();
		auto session = cm->getConnection(CONNECTION_MYSQL_LOGIN_SERVER);
		model::table::HederaIdTuple result_tuple;

		Poco::Data::Statement select(session);
		select << "SELECT h.id, h.shardNum, h.realmNum, h.num FROM hedera_ids as h "
			<< "JOIN hedera_topics as topic ON(topic.topic_hedera_id = h.id) "
			<< "JOIN hedera_accounts as account ON(account.id = topic.auto_renew_account_hedera_id) "
			<< "WHERE topic.group_id = ? AND account.network_type = ?"
			, into(result_tuple), use(groupId), use(networkType);

		try {
			/*select.executeAsync();
			select.wait();
			auto result_count = select.rowsExtracted();*/
			auto result_count = select.execute();
			if (1 == result_count) {
				return new HederaId(new model::table::HederaId(result_tuple));
			}
			else {
				printf("[HederaId::find] result_count other as expected: %d\n", result_count);
			}
		}
		catch (Poco::Exception& ex) {
			auto em = ErrorManager::getInstance();
			static const char* function_name = "HederaId::find";
			em->addError(new ParamError(function_name, "mysql error: ", ex.displayText()));
			em->addError(new ParamError(function_name, "group id: ", groupId));
			em->addError(new ParamError(function_name, "network type: ", (int)networkType));
			em->sendErrorsAsEmail();
		}
		return nullptr;
	}

	void HederaId::copyToProtoAccountId(proto::AccountID* protoAccountId) const
	{
		auto model = getModel();
		protoAccountId->set_shardnum(model->getShardNum());
		protoAccountId->set_realmnum(model->getRealmNum());
		protoAccountId->set_accountnum(model->getNum());
	}

	void HederaId::copyToProtoTopicId(proto::TopicID* protoTopicId) const
	{
		auto model = getModel();
		protoTopicId->set_shardnum(model->getShardNum());
		protoTopicId->set_realmnum(model->getRealmNum());
		protoTopicId->set_topicnum(model->getNum());
	}

	bool HederaId::isExistInDB()
	{
		auto model = getModel();
		if (model->getID() > 0) return true;
		//std::vector<Tuple> loadFromDB(const std::vector<std::string>& fieldNames, const std::vector<WhereFieldType>& fieldValues, MysqlConditionType conditionType = MYSQL_CONDITION_AND, int expectedResults = 0);
		model->isExistInDB();
		return model->getID() != 0;

	}
}