module challenge::arena;

use challenge::hero::{Self, Hero};
use sui::event;
// Sui Framework'ün yeni sürümlerinde aşağıdaki kütüphaneler (object, tx_context, transfer)
// otomatik olarak tanımlıdır. Uyarıları (warnings) yok etmek için 'use' satırlarını kaldırdım.
// Kodun yine de sorunsuz çalışacaktır.

// ========= STRUCTS =========

public struct Arena has key, store {
    id: UID,
    warrior: Hero,
    owner: address,
}

// ========= EVENTS =========

public struct ArenaCreated has copy, drop {
    arena_id: ID,
    timestamp: u64,
}

public struct ArenaCompleted has copy, drop {
    winner_hero_id: ID,
    loser_hero_id: ID,
    timestamp: u64,
}

// ========= FUNCTIONS =========

public fun create_arena(hero: Hero, ctx: &mut TxContext) {

    let arena = Arena {
        id: object::new(ctx),
        warrior: hero,
        owner: ctx.sender(), // tx_context::sender(ctx) yerine kısa hali
    };

    event::emit(
        ArenaCreated {
            arena_id: object::id(&arena),
            timestamp: ctx.epoch_timestamp_ms(), // tx_context::epoch... yerine kısa hali
        },
    ); 

    transfer::share_object(arena);
}

#[allow(lint(self_transfer))]
public fun battle(hero: Hero, arena: Arena, ctx: &mut TxContext) {
    
    // 1. Arena objesini parçalara ayır
    let Arena { id: arena_id, warrior, owner } = arena;

    // 2. ID'leri sakla (Move kuralı gereği transferden önce almalıyız)
    let hero_id_val = object::id(&hero);
    let warrior_id_val = object::id(&warrior);

    // 3. Savaş Mantığı
    if (hero::hero_power(&hero) > hero::hero_power(&warrior)) {
        
        // --- SENARYO 1: Hero Kazanır ---
        transfer::public_transfer(hero, ctx.sender());
        transfer::public_transfer(warrior, ctx.sender());

        event::emit(
            ArenaCompleted {
                winner_hero_id: hero_id_val,
                loser_hero_id: warrior_id_val,
                timestamp: ctx.epoch_timestamp_ms(),
            },
        );

    } else {
        
        // --- SENARYO 2: Warrior (Arena Sahibi) Kazanır ---
        transfer::public_transfer(hero, owner);
        transfer::public_transfer(warrior, owner);

        event::emit(
            ArenaCompleted {
                winner_hero_id: warrior_id_val,
                loser_hero_id: hero_id_val,
                timestamp: ctx.epoch_timestamp_ms(),
            },
        );
    }; // <--- İŞTE KIRMIZI HATAYI ÇÖZEN NOKTALI VİRGÜL BURADA! 
       // if/else bloğu bitti, şimdi diğer komuta geçiyoruz diyoruz.

    // 4. Arena objesini sil
    object::delete(arena_id);
}