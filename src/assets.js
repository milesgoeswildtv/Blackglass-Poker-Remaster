import{chipStackIndex}from'./table-view.js';
const root='/assets',V3='/remaster';

const chipSet=(base,prefix)=>({black:`${base}/${prefix}-black-chip.png`,blue:`${base}/${prefix}-blue-chip.png`,green:`${base}/${prefix}-green-chip.png`,purple:`${base}/${prefix}-purple-chip.png`,red:`${base}/${prefix}-red-chip.png`});
const plaqueSet=(base,prefix,foldName='folded')=>({idle:`${base}/${prefix}-idle-player-plaque.png`,active:`${base}/${prefix}-active-player-plaque.png`,folded:`${base}/${prefix}-${foldName}-player-plaque.png`,allIn:`${base}/${prefix}-all-in-player-plaque.png`});

export const assets={
  default:{
    logoDesktop:`${root}/crashout/CrashoutPokerLogo.png`,
    logoMobile:`${root}/crashout/CrashoutMiniLogo.png`,
    brandLogo:`${root}/crashout/CrashoutPokerLogo.png`,
    heroLogo:`${root}/crashout/CrashoutLogoNoCard.PNG`,
    studioLogo:`${root}/crashout/LostCrashoutSub.PNG`,
    homeMainButtons:`${root}/crashout/HomescreenMainButtons.PNG`,
    playerProfilePlaque:`${root}/crashout/PlayerProfilePlaque.PNG`,
    chatBoxPanel:`${root}/crashout/ChatBoxPanel.PNG`,
    joinTablePanel:`${root}/crashout/JoinTablePanel.PNG`,
    lastHandPanel:`${root}/crashout/LastHandPanel.PNG`,
    createGamePanel:`${root}/crashout/CreateGamePanel.PNG`,
    logoNoWordsNoStatic:`${root}/crashout/LogoNoWordsNoStatic.PNG`,
    lobbyHeader:`${root}/crashout/CrashoutLobbyHeader.PNG`,
    mascotCrow:`${root}/default/the-crow.png`,
    mascotHare:`${root}/default/the-hare.png`,
    avatarFrame:`${root}/default/default-avatar-frame.png`,
    feltDesktop:`${root}/default/desktop-felt.png`,
    feltMobile:`${root}/default/mobile-felt-portrait.png`,
    feltCashV2:`${root}/default/TABLE FELT V2.PNG?v=official-2`,
    lobbyDesktop:`${root}/default/desktop-background.png`,
    lobbyMobile:`${root}/default/mobile-background.png`,
    pot:`${root}/default/default-pot-chips.png`,
    starterCardBack:`${root}/crashout/CrashoutCardBack.PNG`,
    // Approved AFTER HOURS V3 seat tickets (public/remaster). Opponents use the standard ticket; the local player uses the
    // hero/active ticket. An acting opponent gets the hero/active ticket only where its ticket is wide enough to hold the
    // live text at 11px+ (table-skin.css decides from the rendered width); narrower, it keeps the standard ticket and a glow.
    plaques:{idle:`${V3}/afterhours_standard_seat_ticket.png`,active:`${V3}/afterhours_standard_seat_ticket.png`,folded:`${V3}/afterhours_standard_seat_ticket.png`,allIn:`${V3}/afterhours_standard_seat_ticket.png`},
    heroPlaque:`${V3}/afterhours_hero_active_seat_ticket.png`,
    activePlaque:`${V3}/afterhours_hero_active_seat_ticket.png`,
    ticketLayouts:{idle:'v3',active:'v3',folded:'v3',allIn:'v3',hero:'v3Active'},
    chips:{black:`${root}/default/default-chip-black.png`,blue:`${root}/default/default-chip-blue.png`,green:`${root}/default/default-chip-green.png`,purple:`${root}/default/default-chip-purple.png`,red:`${root}/default/default-chip-red.png`},
    // AFTER HOURS V3 chip stacks, smallest to biggest; bets pick one by size (table-view.js chipStackIndex).
    chipStacks:[`${V3}/afterhours_chip_stack_01_red_loose.png`,`${V3}/afterhours_chip_stack_02_red_blue_loose.png`,`${V3}/afterhours_chip_stack_03_mixed_three.png`,`${V3}/afterhours_chip_stack_04_mixed_tall.png`,`${V3}/afterhours_chip_stack_05_mixed_four.png`,`${V3}/afterhours_chip_stack_06_mixed_four_alt.png`],
    // AFTER HOURS V3 gameplay UI art: the neutral action-button shell and the chat/history panel.
    actionShell:`${V3}/afterhours_gameplay_action_button_shell.png`,
    chatHistoryPanel:`${V3}/afterhours_chat_history_panel.png`,
    ui:{actionLog:`${root}/default/action-log.png`,chat:`${root}/default/chat-panel.png`,handHistory:`${root}/default/hand-history.png`,invite:`${root}/default/invite-table-code.png`,spectator:`${root}/default/spectator-ui.png`,showdown:`${root}/default/showdown-ui.png`,tournamentWinner:`${root}/default/tournament-winner-ui.png`,topBar:`${root}/default/top-bar.png`,infoStrip:`${root}/default/info-strip.png`,tournamentStats:`${root}/default/tournament-stats.png`}
  },
  cosmetics:{
    constellation:{label:'Constellation',avatarFrame:`${root}/constellation/constellation-avatar-frame.png`,cardBack:`${root}/constellation/card-back-constellation.png`,plaques:plaqueSet(`${root}/constellation`,'constellation','fold'),chips:chipSet(`${root}/constellation`,'constellation')},
    deadMansHand:{label:"Dead Man's Hand",avatarFrame:`${root}/dead-mans-hand/dead-mans-hand-avatar-frame.png`,cardBack:`${root}/dead-mans-hand/card-back-skull.png`,plaques:plaqueSet(`${root}/dead-mans-hand`,'dead-mans-hand'),chips:chipSet(`${root}/dead-mans-hand`,'dead-mans-hand')},
    regalia:{label:'Regalia',avatarFrame:`${root}/regalia/regalia-avatar-frame.png`,cardBack:`${root}/regalia/regalia-card-back.png`,plaques:plaqueSet(`${root}/regalia`,'regalia'),chips:chipSet(`${root}/regalia`,'regalia')}
  },
  cardBacks:`${root}/card-backs`
};

export const cosmeticOptions=[{key:'default',label:'Crashout Poker'},{key:'constellation',label:'Constellation'},{key:'deadMansHand',label:"Dead Man's Hand"},{key:'regalia',label:'Regalia'}];
export function normalizeCosmetic(value){return cosmeticOptions.some(x=>x.key===value)?value:'default'}
// Default skin: the V3 ticket artwork carries the avatar ring, so no separate frame is drawn over it.
export function skinFor(player){const key=normalizeCosmetic(player?.cosmetic);return key==='default'?{label:'Crashout Poker',avatarFrame:null,cardBack:assets.default.starterCardBack,plaques:assets.default.plaques,heroPlaque:assets.default.heroPlaque,activePlaque:assets.default.activePlaque,ticketLayouts:assets.default.ticketLayouts,chips:assets.default.chips}:assets.cosmetics[key]}
function plaqueState(player){if(player?.folded)return'folded';if(player?.chips===0&&!player?.eliminated)return'allIn';if(player?.turn)return'active';return'idle'}
export function plaqueFor(player){return skinFor(player).plaques[plaqueState(player)]}
// Ticket artwork plus the layout template that says where live text sits on it. `activeSrc` is the wide-screen art for
// an acting default-skin opponent. Purchased packs share one plaque template ('pack') and keep their own state art.
export function ticketFor(player,{hero=false}={}){const skin=skinFor(player),state=plaqueState(player),key=hero&&skin.heroPlaque?'hero':state;return{src:key==='hero'?skin.heroPlaque:skin.plaques[state],layout:skin.ticketLayouts?.[key]||'pack',activeSrc:key!=='hero'&&state==='active'?skin.activePlaque||null:null}}
export function avatarFrameFor(player){return skinFor(player).avatarFrame}
export function cardBackFor(player){return skinFor(player).cardBack}
export function chipFor(player,color='purple'){return skinFor(player).chips?.[color]||assets.default.chips[color]||assets.default.chips.purple}
// A bet's chip art at the table: an equipped pack keeps its own chip; the default skin shows the AFTER HOURS V3 stack for
// the bet's size.
export function betChipFor(player,amount,bigBlind){return normalizeCosmetic(player?.cosmetic)==='default'?assets.default.chipStacks[chipStackIndex(amount,bigBlind)]:chipFor(player,'purple')}
