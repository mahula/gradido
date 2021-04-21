<?php
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: gradido/ManageNodeGroupAdd.proto

namespace Proto\Gradido;

use Google\Protobuf\Internal\GPBType;
use Google\Protobuf\Internal\RepeatedField;
use Google\Protobuf\Internal\GPBUtil;

/**
 * Generated from protobuf message <code>proto.gradido.ManageNodeGroupAdd</code>
 */
class ManageNodeGroupAdd extends \Google\Protobuf\Internal\Message
{
    /**
     * Generated from protobuf field <code>string group_name = 1;</code>
     */
    private $group_name = '';
    /**
     * Generated from protobuf field <code>string group_alias = 2;</code>
     */
    private $group_alias = '';
    /**
     *string parent_group_alias = 4; 
     *
     * Generated from protobuf field <code>.proto.gradido.HederaID hedera_topic_id = 3;</code>
     */
    private $hedera_topic_id = null;

    /**
     * Constructor.
     *
     * @param array $data {
     *     Optional. Data for populating the Message object.
     *
     *     @type string $group_name
     *     @type string $group_alias
     *     @type \Proto\Gradido\HederaID $hedera_topic_id
     *          string parent_group_alias = 4; 
     * }
     */
    public function __construct($data = NULL) {
        \GPBMetadata\Gradido\ManageNodeGroupAdd::initOnce();
        parent::__construct($data);
    }

    /**
     * Generated from protobuf field <code>string group_name = 1;</code>
     * @return string
     */
    public function getGroupName()
    {
        return $this->group_name;
    }

    /**
     * Generated from protobuf field <code>string group_name = 1;</code>
     * @param string $var
     * @return $this
     */
    public function setGroupName($var)
    {
        GPBUtil::checkString($var, True);
        $this->group_name = $var;

        return $this;
    }

    /**
     * Generated from protobuf field <code>string group_alias = 2;</code>
     * @return string
     */
    public function getGroupAlias()
    {
        return $this->group_alias;
    }

    /**
     * Generated from protobuf field <code>string group_alias = 2;</code>
     * @param string $var
     * @return $this
     */
    public function setGroupAlias($var)
    {
        GPBUtil::checkString($var, True);
        $this->group_alias = $var;

        return $this;
    }

    /**
     *string parent_group_alias = 4; 
     *
     * Generated from protobuf field <code>.proto.gradido.HederaID hedera_topic_id = 3;</code>
     * @return \Proto\Gradido\HederaID
     */
    public function getHederaTopicId()
    {
        return $this->hedera_topic_id;
    }

    /**
     *string parent_group_alias = 4; 
     *
     * Generated from protobuf field <code>.proto.gradido.HederaID hedera_topic_id = 3;</code>
     * @param \Proto\Gradido\HederaID $var
     * @return $this
     */
    public function setHederaTopicId($var)
    {
        GPBUtil::checkMessage($var, \Proto\Gradido\HederaID::class);
        $this->hedera_topic_id = $var;

        return $this;
    }

}

