module challenge::hero;

use std::string::String;
// Gerekli kütüphaneler eklendi
use sui::object::{Self, UID, ID};
use sui::transfer;
use sui::tx_context::{Self, TxContext};

// ========= STRUCTS =========
public struct Hero has key, store {
    id: UID,
    name: String,
    image_url: String,
    power: u64,
}

public struct HeroMetadata has key, store {
    id: UID,
    timestamp: u64,
}

// ========= FUNCTIONS =========

#[allow(lint(self_transfer))]
public fun create_hero(name: String, image_url: String, power: u64, ctx: &mut TxContext) {
    
    // 1. Hero objesini oluştur
    let hero = Hero {
        id: object::new(ctx),
        name,
        image_url,
        power,
    };
    
    // 2. Hero'yu işlemi yapan kişiye (sender) transfer et
    transfer::public_transfer(hero, tx_context::sender(ctx));

    // 3. Metadata objesini oluştur
    let metadata = HeroMetadata {
        id: object::new(ctx),
        timestamp: tx_context::epoch_timestamp_ms(ctx),
    };

    // 4. Metadata'yı dondur (Immutable yap)
    // NOT: Önceki koddaki 'public_transfer' satırı silindi, çünkü
    // bir objeyi hem transfer edip hem donduramazsın (move semantics).
    transfer::freeze_object(metadata);
}

// ========= GETTER FUNCTIONS =========

public fun hero_power(hero: &Hero): u64 {
    hero.power
}

#[test_only]
public fun hero_name(hero: &Hero): String {
    hero.name
}

#[test_only]
public fun hero_image_url(hero: &Hero): String {
    hero.image_url
}

#[test_only]
public fun hero_id(hero: &Hero): ID {
    object::id(hero)
}