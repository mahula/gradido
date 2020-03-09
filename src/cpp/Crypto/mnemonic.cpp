

#include "mnemonic.h"
#include <memory>
#include <cstring>
#include <assert.h>
#include "../dependencies/tinf/src/tinf.h"

#include "DRRandom.h"

Mnemonic::Mnemonic()
{
	memset(mWords, 0, 2048);
//	mWordHashIndices.resize(2048);
}

Mnemonic::~Mnemonic()
{
	clear();
}



int Mnemonic::init(void(*fill_words_func)(unsigned char*), unsigned int original_size, unsigned int compressed_size)
{
	Poco::Mutex::ScopedLock _lock(mWorkingMutex, 500);
	clear();

	unsigned char* buffer = (unsigned char*)malloc(compressed_size);
	unsigned char* uncompressed_buffer = (unsigned char*)malloc(original_size + 1);
	memset(uncompressed_buffer, 0, original_size + 1);
	fill_words_func(buffer);

	// uncompress
	unsigned int original_size_cpy = original_size;

	if (tinf_gzip_uncompress(uncompressed_buffer, &original_size_cpy, buffer, compressed_size) != TINF_OK) {
		free(buffer);
		free(uncompressed_buffer);
		return -1;
	}
	if (original_size_cpy != original_size) {
		free(buffer);
		free(uncompressed_buffer);
		return -2;
	}
	else {
		free(buffer);

		DRRandom::seed(compressed_size);


		//printf("c[Mnemonic::%s] uncompressing success\n", __FUNCTION__);
		// fill words in array and hashList

		//FILE* f = fopen("uncompressed_buffer", "a");
		//fwrite(uncompressed_buffer, sizeof(char), original_size, f);
		//fclose(f);

		unsigned short cursor = 0;
		u32 word_begin = 0, word_end = 0;

		for (unsigned int i = 0; i < original_size; i++) {
			if (cursor >= 2048) {
				return -3;
			}
			if (uncompressed_buffer[i] == ',' || i == original_size - 1) {
				word_end = i;

				u32 word_size = word_end - word_begin;
				if (word_end < word_begin) {
					//printf("%c %c %c\n", uncompressed_buffer[i - 1], uncompressed_buffer[i], uncompressed_buffer[i + 1]);
					//printf("%s\n", uncompressed_buffer);
					continue;
				}
				if (uncompressed_buffer[i] != ',') {
					//printf("last char: %c\n", uncompressed_buffer[i]);
					word_size++;
				}
				// + 1 for null terminating
				mWords[cursor] = (char*)malloc(word_size + 1);

				// fill hash list for fast reverse lookup
				memset(mWords[cursor], 0, word_size + 1);
				if (word_begin + word_size > original_size) {
					printf("c[Mnemonic::%s] word goes out of array bounds\n", __FUNCTION__);
					free(uncompressed_buffer);
					return -4;
				}
				memcpy(mWords[cursor], &uncompressed_buffer[word_begin], word_size);

				//char bu[256]; memset(bu, 0, 256);
				//memcpy(bu, &uncompressed_buffer[word_begin - 1], 15);
				//printf("word (%d): %s\n", cursor, bu);

				DHASH word_hash = DRMakeStringHash(mWords[cursor]);
				//mWordHashIndices.addByHash(word_hash, (void*)cursor);
				auto result = mWordHashIndices.insert(WordHashEntry(word_hash, cursor));
				if (!result.second) {
					// handle hash collision
					auto it_collide = mHashCollisionWords.find(word_hash);
					if (it_collide == mHashCollisionWords.end()) {
						std::map<std::string, unsigned short> collidedWordsMap;
						collidedWordsMap.insert(HashCollideWordEntry(mWords[result.first->second], result.first->second));
						auto result2 = mHashCollisionWords.insert(std::pair<DHASH, std::map<std::string, unsigned short>>(word_hash, collidedWordsMap));
						if (!result2.second) {
							free(uncompressed_buffer);
							printf("c[Mnemonc::%s] error inserting hash collided word map\n", __FUNCTION__);
							return -6;
						}
						it_collide = result2.first;
					}
					assert(it_collide != mHashCollisionWords.end());

					auto result3 = it_collide->second.insert(HashCollideWordEntry(mWords[cursor], cursor));
					if (!result3.second) {
						free(uncompressed_buffer);
						printf("c[Mnemonc::%s] error inserting hash collided word entry\n", __FUNCTION__);
						return -7;
					}

					//printf("c[Mnemonic::%s] error inserting word, hash collision?\n", __FUNCTION__);
					//printf("current word: %s\n", mWords[cursor]);
					//printf("existing word: %s\n", mWords[result.first->second]);
				}

				word_begin = i + 1;
				cursor++;
			}
		}
		//printf("c[Mnemonic::%s] before freeing uncompressed buffer \n", __FUNCTION__);
		free(uncompressed_buffer);

		// remove hash colliding entrys from regular map
		for (auto it_collide = mHashCollisionWords.begin(); it_collide != mHashCollisionWords.end(); it_collide++) {
			mWordHashIndices.erase(it_collide->first);
		}

		return 0;
	}
	//printf("c[Mnemonic::%s] before freeing buffer \n", __FUNCTION__);
	free(buffer);
	return -5;
}

short Mnemonic::getWordIndex(const char* word) const 
{ 
	DHASH word_hash = DRMakeStringHash(word); 
	auto it = mWordHashIndices.find(word_hash);
	if (it != mWordHashIndices.end()) {
		return it->second;
	}
	auto it_collide = mHashCollisionWords.find(word_hash);
	if (it_collide != mHashCollisionWords.end()) {
		auto it_collided_word = it_collide->second.find(word);
		if (it_collided_word != it_collide->second.end()) {
			return it_collided_word->second;
		}
	}
	return -1;
}

/*
bool Mnemonic::isWordExist(const std::string& word) const 
{ 
	return getWordIndex(word.data()) != -1;
	//DHASH word_hash = DRMakeStringHash(word.data());  
	//return mWordHashIndices.find(word_hash) != mWordHashIndices.end(); 
}
*/

void Mnemonic::clear()
{
	//Poco::Mutex::ScopedLock _lock(mWorkingMutex, 500);
	for (int i = 0; i < 2048; i++) {
		if (mWords[i]) {
			free(mWords[i]);
		}
	}
	memset(mWords, 0, 2048);
	mWordHashIndices.clear();
	mHashCollisionWords.clear();
}

std::string Mnemonic::getCompleteWordList()
{
	std::string result("");
	for (int i = 0; i < 2048; i++) {
		if (mWords[i]) {
			result += std::to_string(i) + ": " + mWords[i] + "\n";
		}
		else {
			result += std::to_string(i) + ": <word empty>\n";
		}
	}
	return result;
}

void Mnemonic::printToFile(const char* filename)
{
	FILE* f = fopen(filename, "wt");
	auto words = getCompleteWordList();
	fwrite(words.data(), 1, words.size(), f);
	fclose(f);
}

Poco::JSON::Array Mnemonic::getSortedWordList()
{
	std::list<std::string> words;
	for (auto it = mWordHashIndices.begin(); it != mWordHashIndices.end(); it++) {
		words.push_back(mWords[it->second]);
	}
	words.sort();
	Poco::JSON::Array json;
	for (auto it = words.begin(); it != words.end(); it++) {
		json.add(*it);
	}
//	json.stringify()
	return json;
}