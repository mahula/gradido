<?php
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: gradido/GradidoCreation.proto

namespace GPBMetadata\Gradido;

class GradidoCreation
{
    public static $is_initialized = false;

    public static function initOnce() {
        $pool = \Google\Protobuf\Internal\DescriptorPool::getGeneratedPool();

        if (static::$is_initialized == true) {
          return;
        }
        \GPBMetadata\Gradido\BasicTypes::initOnce();
        $pool->internalAddGeneratedFile(hex2bin(
            "0ab0010a1d6772616469646f2f4772616469646f4372656174696f6e2e70" .
            "726f746f120d70726f746f2e6772616469646f22780a0f4772616469646f" .
            "4372656174696f6e122f0a08726563656976657218012001280b321d2e70" .
            "726f746f2e6772616469646f2e5472616e73666572416d6f756e7412340a" .
            "0b7461726765745f6461746518032001280b321f2e70726f746f2e677261" .
            "6469646f2e54696d657374616d705365636f6e6473620670726f746f33"
        ), true);

        static::$is_initialized = true;
    }
}
