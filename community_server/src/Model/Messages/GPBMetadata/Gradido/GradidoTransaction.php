<?php
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: gradido/GradidoTransaction.proto

namespace GPBMetadata\Gradido;

class GradidoTransaction
{
    public static $is_initialized = false;

    public static function initOnce() {
        $pool = \Google\Protobuf\Internal\DescriptorPool::getGeneratedPool();

        if (static::$is_initialized == true) {
          return;
        }
        \GPBMetadata\Gradido\BasicTypes::initOnce();
        $pool->internalAddGeneratedFile(hex2bin(
            "0a91010a206772616469646f2f4772616469646f5472616e73616374696f" .
            "6e2e70726f746f120d70726f746f2e6772616469646f22560a1247726164" .
            "69646f5472616e73616374696f6e122c0a077369675f6d61701801200128" .
            "0b321b2e70726f746f2e6772616469646f2e5369676e61747572654d6170" .
            "12120a0a626f64795f627974657318022001280c620670726f746f33"
        ), true);

        static::$is_initialized = true;
    }
}
