import { player, format } from './Synergism';
import { Globals as G, Upgrade } from './Variables';
import Decimal from 'break_infinity.js';
import { calculateAnts, calculateCorruptionPoints, calculateRuneLevels } from './Calculate';
import { sumContents } from './Utility';
import { buyUpgrades } from './Buy';
import { buyGenerator, buyAutobuyers } from './Automation';
import { revealStuff } from './UpdateHTML';
import { DOMCacheGetOrSet } from './Cache/DOM';
import i18next from 'i18next';

const crystalupgdesc: Record<number, () => Record<string, string>> = {
    3: () => ({
        max: format(
            100 * (0.12 + 0.88 * player.upgrades[122] + 0.001 * player.researches[129] *
        Math.log(player.commonFragments + 1) / Math.log(4)), 2, true
        )
    }),
    4: () => ({
        max: format(
            10 + 0.05 * player.researches[129] * Math.log(player.commonFragments + 1) /
        Math.log(4) + 20 * calculateCorruptionPoints() / 400 * G['effectiveRuneSpiritPower'][3]
        )
    })
}

const constantUpgDesc: Record<number, () => Record<string, string>> = {
    1: () => ({ level: format(5 + player.achievements[270] + 0.1 * player.platonicUpgrades[18], 1, true) }),
    2: () => ({
        max: format(
            10 + player.achievements[270] + player.shopUpgrades.constantEX + 100 *
        (G['challenge15Rewards'].exponent - 1) + 0.3 * player.platonicUpgrades[18], 2, true
        )
    })
}

const upgradetexts = [
    () => 'Worker Production x' + format((G['totalCoinOwned'] + 1) * Math.min(1e30, Math.pow(1.008, G['totalCoinOwned'])), 2),
    () => 'Investment Production x' + format((G['totalCoinOwned'] + 1) * Math.min(1e30, Math.pow(1.008, G['totalCoinOwned'])), 2),
    () => 'Printer Production x' + format((G['totalCoinOwned'] + 1) * Math.min(1e30, Math.pow(1.008, G['totalCoinOwned'])), 2),
    () => 'Mint Production x' + format((G['totalCoinOwned'] + 1) * Math.min(1e30, Math.pow(1.008, G['totalCoinOwned'])), 2),
    () => 'Alchemy Production x' + format((G['totalCoinOwned'] + 1) * Math.min(1e30, Math.pow(1.008, G['totalCoinOwned'])), 2),
    () => 'All Coin production x' + format((G['totalCoinOwned'] + 1) * Math.min(1e30, Math.pow(1.008, G['totalCoinOwned'])), 2),
    () => 'Gain ' + Math.min(4, 1 + Math.floor(Decimal.log(player.fifthOwnedCoin + 1, 10))) + ' free Multipliers from bought Alchemies.',
    () => '+' + Math.floor(player.multiplierBought / 7) + ' free Accelerators.',
    () => '+' + Math.floor(player.acceleratorBought / 10) + ' free Multipliers.',
    () => 'Worker Production x' + format(Decimal.pow(2, Math.min(50, player.secondOwnedCoin / 15)), 2),
    () => 'Generator efficiency x' + format(Decimal.pow(1.02, G['freeAccelerator']), 2),
    () => 'All Coin production x' + format(Decimal.min(1e4, Decimal.pow(1.01, player.prestigeCount)), 2),
    () => 'Investment Production x' + format(Decimal.min(1e50, Decimal.pow(player.firstGeneratedMythos.add(player.firstOwnedMythos).add(1), 4 / 3).times(1e10)), 2),
    () => 'Printer Generation x' + format(Decimal.pow(1.15, G['freeAccelerator']), 2),
    () => 'Mint Generation x' + format(Decimal.pow(1.15, G['freeAccelerator']), 2),
    () => 'Gain ' + format(Decimal.pow(G['acceleratorEffect'], 1 / 3), 2) + 'x more Diamonds on Prestige',
    () => 'Mint Production x1e100 (Duh)',
    () => 'Printer Production x' + format(Decimal.min(1e125, player.transcendShards.add(1))),
    () => 'Investment Production x' + format(Decimal.min(1e200, player.transcendPoints.times(1e30).add(1))),
    () => 'All coin production is further multiplied by ' + format(Decimal.pow((G['totalCoinOwned'] + 1) * Math.min(1e30, Math.pow(1.008, G['totalCoinOwned'])), 10), 2) + ' [Stacks with upgrade 1]!',
    () => '+' + format(Math.floor((1 + (1 / 101 * G['freeMultiplier'])))) + ' Multipliers, +' + format(Math.floor((5 + (1 / 101 * G['freeAccelerator'])))) + ' Accelerators.',
    () => '+' + format(Math.floor((1 + (1 / 101 * G['freeMultiplier'])))) + ' Multipliers, +' + format(Math.floor((4 + (1 / 101 * G['freeAccelerator'])))) + ' Accelerators.',
    () => '+' + format(Math.floor((1 + (1 / 101 * G['freeMultiplier'])))) + ' Multipliers, +' + format(Math.floor((3 + (1 / 101 * G['freeAccelerator'])))) + ' Accelerators.',
    () => '+' + format(Math.floor((1 + (1 / 101 * G['freeMultiplier'])))) + ' Multipliers, +' + format(Math.floor((2 + (1 / 101 * G['freeAccelerator'])))) + ' Accelerators.',
    () => '+' + format(Math.floor((1 + (1 / 101 * G['freeMultiplier'])))) + ' Multipliers, +' + format(Math.floor((1 + (1 / 101 * G['freeAccelerator'])))) + ' Accelerators.',
    () => '+1 Accelerator Boost.',
    () => '+' + format(Math.min(250, Math.floor(Decimal.log(player.coins.add(1), 1e3))) + Math.max(0, Math.min(1750, Math.floor(Decimal.log(player.coins.add(1), 1e15)) - 50))) + ' Accelerators.',
    () => '+' + format(Math.min(1000, Math.floor((player.firstOwnedCoin + player.secondOwnedCoin + player.thirdOwnedCoin + player.fourthOwnedCoin + player.fifthOwnedCoin) / 160))) + ' Multipliers.',
    () => '+' + format(Math.floor(Math.min(2000, (player.firstOwnedCoin + player.secondOwnedCoin + player.thirdOwnedCoin + player.fourthOwnedCoin + player.fifthOwnedCoin) / 80))) + ' Accelerators.',
    () => '+' + format(Math.min(75, Math.floor(Decimal.log(player.coins.add(1), 1e10))) + Math.min(925, Math.floor(Decimal.log(player.coins.add(1), 1e30)))) + ' Multipliers.',
    () => '+' + format(Math.floor(G['totalCoinOwned'] / 2000)) + ' Accelerator Boosts',
    () => '+' + format(Math.min(500, Math.floor(Decimal.log(player.prestigePoints.add(1), 1e25)))) + ' Accelerators',
    () => '+' + format(G['totalAcceleratorBoost']) + ' Multipliers',
    () => '+' + format(Math.floor(3 / 103 * G['freeMultiplier'])) + ' Multipliers',
    () => '+' + format(Math.floor(2 / 102 * G['freeMultiplier'])) + ' Multipliers',
    () => 'All Crystal producers x' + format(Decimal.min('1e5000', Decimal.pow(player.prestigePoints, 1 / 500)), 2),
    () => 'All Mythos producers production x' + format(Decimal.pow(Decimal.log(player.prestigePoints.add(10), 10), 2), 2),
    () => i18next.t('upgrades.upgradeTexts.30boosts'),
    () => i18next.t('upgrades.upgradeTexts.30boosts'),
    () => i18next.t('upgrades.upgradeTexts.30boosts'),
    () => 'Welcome to Transcension! Coin production is multiplied by ' + format(Decimal.min(1e30, Decimal.pow(player.transcendPoints.add(1), 1 / 2))) + '.',
    () => 'All Mythos Shard producers are going into overdrive: x' + format(Decimal.min(1e50, Decimal.pow(player.prestigePoints.add(1), 1 / 50).dividedBy(2.5).add(1)), 2) + ' the production!',
    () => 'Multiply all coin production by ' + format(Decimal.min(1e30, Decimal.pow(1.01, player.transcendCount)), 2) + '!',
    () => 'Multiply Mythos gained in Transcension by ' + format(Decimal.min(1e6, Decimal.pow(1.01, player.transcendCount)), 2) + '!',
    () => '+' + format(Math.min(2500, Math.floor(Decimal.log(player.transcendShards.add(1), 10)))) + ' Accelerators!',
    () => 'It\'s kinda self-evident, ain\'t it?',
    () => 'Mythos-tier producers production x' + format(Math.pow(1.05, player.achievementPoints) * (player.achievementPoints + 1), 2),
    () => 'Multiply coin production by a factor of ' + format(Math.pow((Math.min(1e25, G['totalMultiplier'] * G['totalAccelerator']) / 1000 + 1), 8)) + '!',
    () => '+' + format(Math.min(50, Math.floor(Decimal.log(player.transcendPoints.add(1), 1e10)))) + ' Multipliers through magic!',
    () => 'It\'s quite obvious what the benefit is, but you must be in a Challenge for it to be in use!',
    () => 'Mythos-tier producers production x' + format(Math.pow(G['totalAcceleratorBoost'], 2), 2) + '!',
    () => 'Mythos-tier producers production x' + format(Decimal.pow(G['globalMythosMultiplier'], 0.025), 2) + '! It\'s like inception, or something.',
    () => 'Augments will produce ' + format(Decimal.min('1e1250', Decimal.pow(G['acceleratorEffect'], 1 / 125)), 2) + 'x as many Mythos Shards.',
    () => 'Wizards will produce ' + format(Decimal.min('1e2000', Decimal.pow(G['multiplierEffect'], 1 / 180)), 2) + 'x as many Enchantments; What productive spirits!',
    () => 'Grandmasters will produce ' + format((Decimal.pow('1e1000', Math.min(1000, G['buildingPower'] - 1))), 2) + 'x as many Oracles!',
    () => 'It\'s quite obvious, ain\'t it?',
    () => i18next.t('upgrades.upgradeTexts.lookAbove'),
    () => i18next.t('upgrades.upgradeTexts.lookAbove'),
    () => i18next.t('upgrades.upgradeTexts.lookAbove'),
    () => i18next.t('upgrades.upgradeTexts.lookAbove'),
    () => '+5% Offering Recycle/+2EXP per Offerings. Duh!',
    () => 'Base Offering amount for Reincarnations +' + Math.floor(1 / 5 * (sumContents(player.challengecompletions))) + '. Challenge yourself!',
    () => 'All Crystal production x' + format(Decimal.min('1e6000', Decimal.pow(player.reincarnationPoints.add(1), 6))),
    () => 'All Mythos Shard production x' + format(Decimal.pow(player.reincarnationPoints.add(1), 2)),
    () => '5x Particle gain from Reincarnations. Duh!',
    () => 'It\'s quite clear in the description!',
    () => 'The first particle-tier producer is ' + format(Decimal.pow(1.03, player.firstOwnedParticles + player.secondOwnedParticles + player.thirdOwnedParticles + player.fourthOwnedParticles + player.fifthOwnedParticles), 2) + 'x as productive.',
    () => 'Your compliance with tax laws provides you with ' + format(Math.min(2500, Math.floor(1 / 1000 * Decimal.log(G['taxdivisor'], 10)))) + ' free Multipliers, for some reason.',
    () => {
        const a = Decimal.pow(Decimal.log(G['reincarnationPointGain'].add(10), 10), 0.5);
        const b = Decimal.pow(Decimal.log(G['reincarnationPointGain'].add(10), 10), 0.5);
        return 'Cosmic Magnetics will allow you to gain ' +
            format(Math.min(10, new Decimal(a).toNumber()), 2) +
            'x as much Obtainium reincarnating, x' +
            format(Math.min(3, new Decimal(b).toNumber()), 2) +
            ' automation gain.';
    },
    () => 'Contracted time makes your game timers run ' + format(1/3 * Math.log(player.maxobtainium + 1)/Math.log(10),2,true) + '% more quickly.',
    () => 'Writing\'s on the wall. Look above!',
    () => 'Obtainium multiplier: x' + Math.min(50, (1 + 2 * player.challengecompletions[6] + 2 * player.challengecompletions[7] + 2 * player.challengecompletions[8] + 2 * player.challengecompletions[9] + 2 * player.challengecompletions[10])),
    () => 'Same as Transcend upgrade 10, except you MUST be in a Reincarnation Challenge in particular.',
    () => 'Obtainium multiplier: x' + format((1 + 4 * Math.min(1, Math.pow(player.maxofferings / 100000, 0.5))), 2),
    () => 'Offering Multiplier: x' + format((1 + 2 * Math.min(1, Math.pow(player.maxobtainium / 30000000, 0.5))), 2),
    () => 'Epic 5x Ants!',
    () => 'Ant Speed Multiplier: x' + format((Decimal.pow(1.004 + 4 / 100000 * player.researches[96], player.firstOwnedAnts + player.secondOwnedAnts + player.thirdOwnedAnts + player.fourthOwnedAnts + player.fifthOwnedAnts + player.sixthOwnedAnts + player.seventhOwnedAnts + player.eighthOwnedAnts)), 3),
    () => 'Ant Speed Multiplier: x' + format(1 + 0.005 * Math.pow(Math.log(player.maxofferings + 1)/Math.log(10),2),2,true),
    () => 'You will gain +10% rewards =)',
    () => 'Ant ELO +75 if this upgrade is purchased.',
    ...Array.from({ length: 39 }, () => () => i18next.t('upgrades.upgradeTexts.allYouNeed')),
    () => '-50% Taxes duh!',
    () => '+88% cap to Crystal Upgrade 3, duh!',
    () => 'Coin Production ^1.025, duh!',
    () => '+3% Effective Ant ELO, duh!',
    () => '+' + format(0.333 * player.challengecompletions[10], 0) + '% Constant Divisor power.'
]

export const upgradeeffects = (i: number) => {
    DOMCacheGetOrSet('upgradeeffect').textContent = 'Effect: ' + upgradetexts[i - 1]();
}

export const upgradedescriptions = (i: number) => {
    const y = i18next.t(`upgrades.descriptions.${i}`)
    const z = player.upgrades[i] > 0.5 ? ' BOUGHT!' : '';

    const el = DOMCacheGetOrSet('upgradedescription');
    el.textContent = y + z;
    el.style.color = player.upgrades[i] > 0.5 ? 'gold' : 'white';

    if (player.toggles[9] === true) {
        clickUpgrades(i, false);
    }

    let currency = ''
    let color = ''
    if ((i <= 20 && i >= 1) || (i <= 110 && i >= 106) || (i <= 125 && i >= 121)) {
        currency = 'Coins';
        color = 'yellow'
    }
    if ((i <= 40 && i >= 21) || (i <= 105 && i >= 101) || (i <= 115 && i >= 111) || (i <= 87 && i >= 81)) {
        currency = 'Diamonds';
        color = 'cyan'
    }
    if ((i <= 60 && i >= 41) || (i <= 120 && i >= 116) || (i <= 93 && i >= 88)) {
        currency = 'Mythos';
        color = 'plum'
    }
    if ((i <= 80 && i >= 61) || (i <= 100 && i >= 94)) {
        currency = 'Particles';
        color = 'limegreen'
    }

    DOMCacheGetOrSet('upgradecost').textContent = 'Cost: ' + format(Decimal.pow(10, G['upgradeCosts'][i])) + ' ' + currency
    DOMCacheGetOrSet('upgradecost').style.color = color
    upgradeeffects(i)
}

export const clickUpgrades = (i: number, auto: boolean) => {
    // Make sure the upgrade is locked
    if (
        player.upgrades[i] !== 0 ||
        (i <= 40 && i >= 21 && !player.unlocks.prestige) ||
        (i <= 60 && i >= 41 && !player.unlocks.transcend) ||
        (i <= 80 && i >= 61 && !player.unlocks.reincarnate) ||
        (i <= 120 && i >= 81 && !player.unlocks.prestige) ||
        DOMCacheGetOrSet(`upg${i}`)!.style.display === 'none'
    ) {
        return;
    }

    let type: Upgrade | undefined
    if (i <= 20 && i >= 1) {
        type = Upgrade.coin;
    }
    if (i <= 40 && i >= 21) {
        type = Upgrade.prestige;
    }
    if (i <= 60 && i >= 41) {
        type = Upgrade.transcend;
    }
    if (i <= 80 && i >= 61) {
        type = Upgrade.reincarnation;
    }
    if (i <= 87 && i >= 81) {
        type = Upgrade.prestige;
    }
    if (i <= 93 && i >= 88) {
        type = Upgrade.transcend;
    }
    if (i <= 100 && i >= 94) {
        type = Upgrade.reincarnation;
    }
    if (type && i <= 80 && i >= 1) {
        buyUpgrades(type, i, auto);
    }
    if (type && i <= 100 && i >= 81) {
        buyAutobuyers(i - 80, auto);
    }
    if (i <= 120 && i >= 101) {
        buyGenerator(i - 100, auto);
    }
    if (i <= 125 && i >= 121) {
        buyUpgrades(Upgrade.coin, i, auto);
    }
}

export const categoryUpgrades = (i: number, auto: boolean) => {
    let min = 0;
    let max = 0;
    if (i === 1) {
        min = 121;
        max = 125;
        for (let i = 1; i <= 20; i++) {
            clickUpgrades(i, auto);
        }
    }
    if (i === 2) {
        min = 21;
        max = 40;
    }
    if (i === 3) {
        min = 41;
        max = 60;
    }
    if (i === 4) {
        min = 101;
        max = 120;
    }
    if (i === 5) {
        min = 81;
        max = 100;
    }
    if (i === 6) {
        min = 61;
        max = 80;
    }
    for (let i = min; i <= max; i++) {
        clickUpgrades(i, auto);
    }
}

const crystalupgeffect: Record<number, () => string> = {
    1: () => `Crystal production x${format(Decimal.min(Decimal.pow(10, 50 + 2 * player.crystalUpgrades[0]), Decimal.pow(1.05, player.achievementPoints * player.crystalUpgrades[0])), 2, true)}`,
    2: () => `Crystal production x${format(Decimal.min(Decimal.pow(10, 100 + 5 * player.crystalUpgrades[1]), Decimal.pow(Decimal.log(player.coins.add(1), 10), player.crystalUpgrades[1] / 3)), 2, true)}`,
    3: () => `Crystal production x${format(Decimal.pow(1 + Math.min(0.12 + 0.88 * player.upgrades[122] + 0.001 * player.researches[129] * Math.log(player.commonFragments + 1) / Math.log(4), 0.001 * player.crystalUpgrades[2]), player.firstOwnedDiamonds + player.secondOwnedDiamonds + player.thirdOwnedDiamonds + player.fourthOwnedDiamonds + player.fifthOwnedDiamonds), 2, true)}`,
    4: () => `Coin production multiplier exponent +${format(Math.min(10 + 0.05 * player.researches[129] * Math.log(player.commonFragments + 1) / Math.log(4) + 20 * calculateCorruptionPoints() / 400 * G['effectiveRuneSpiritPower'][3], 0.05 * player.crystalUpgrades[3]), 2, true)}`,
    5: () => `Crystal production x${format(Decimal.pow(1.01, (player.challengecompletions[1] + player.challengecompletions[2] + player.challengecompletions[3] + player.challengecompletions[4] + player.challengecompletions[5]) * player.crystalUpgrades[4]), 2, true)}`
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
const returnCrystalUpgDesc = (i: number) => i18next.t(`upgrades.crystalUpgrades.${i}`, crystalupgdesc[i]?.())
const returnCrystalUpgEffect = (i: number) => i18next.t('buildings.crystalUpgrades.currentEffect', {
    effect: i in crystalupgeffect ? crystalupgeffect[i]() : ''
})

export const crystalupgradedescriptions = (i: number) => {
    const p = player.crystalUpgrades[i - 1];
    const c =
        (player.upgrades[73] > 0.5 && player.currentChallenge.reincarnation !== 0 ? 10 : 0) +
        (Math.floor(G['rune3level'] * G['effectiveLevelMult'] /16) * 100 / 100);

    const q = Decimal.pow(10, (G['crystalUpgradesCost'][i - 1] + G['crystalUpgradeCostIncrement'][i - 1] * Math.floor(Math.pow(player.crystalUpgrades[i - 1] + 0.5 - c, 2) / 2)));
    DOMCacheGetOrSet('crystalupgradedescription').textContent = returnCrystalUpgDesc(i);
    DOMCacheGetOrSet('crystalupgradeslevel1').innerHTML = i18next.t('buildings.crystalUpgrades.currentLevel', {
        amount: format(p, 0, true)
    })
    DOMCacheGetOrSet('crystalupgradescost1').innerHTML = i18next.t('buildings.crystalUpgrades.cost', { amount: format(q) })
    DOMCacheGetOrSet('crystalupgradeseffect1').innerHTML = returnCrystalUpgEffect(i);
}


export const upgradeupdate = (num: number, fast?: boolean) => {
    const el = DOMCacheGetOrSet(`upg${num}`);
    if (player.upgrades[num] > 0.5) {
        el.style.backgroundColor = 'green';
    } else {
        el.style.backgroundColor = '';
    }

    const b = i18next.t(`upgrades.descriptions.${num}`)
    const c = player.upgrades[num] > 0.5 ? ' BOUGHT!' : '';
    if (player.upgrades[num] > 0.5) {
        if (!fast) {
            DOMCacheGetOrSet('upgradedescription').textContent = b + c
            DOMCacheGetOrSet('upgradedescription').style.color = 'gold'
        }
    }

    if (!fast) {
        revealStuff()
    }
}

export const ascendBuildingDR = () => {
    const sum = player.ascendBuilding1.owned + player.ascendBuilding2.owned + player.ascendBuilding3.owned + player.ascendBuilding4.owned + player.ascendBuilding5.owned

    if (sum > 100000) {
        return Math.pow(100000, 0.5) * Math.pow(sum, 0.5)
    } else {
        return sum
    }
}

const constUpgEffect: Record<number, () => string> = {
    1: () => `Tesseract building production x${format(Decimal.pow(1.05 + 0.01 * player.achievements[270] + 0.001 * player.platonicUpgrades[18], player.constantUpgrades[1]), 2, true)}`,
    2: () => `Tesseract building production x${format(Decimal.pow(1 + 0.001 * Math.min(100 + 10 * player.achievements[270] + 10 * player.shopUpgrades.constantEX + 3 * player.platonicUpgrades[18] + 1000 * (G['challenge15Rewards'].exponent - 1), player.constantUpgrades[2]), ascendBuildingDR()), 2, true)}`,
    3: () => `Offering gain x${format(1 + 0.02 * player.constantUpgrades[3], 2, true)}`,
    4: () => `Obtainium gain x${format(1 + 0.04 * player.constantUpgrades[4], 2, true)}`,
    5: () => `Ant Speed x${format(Decimal.pow(1 + 0.1 * Decimal.log(player.ascendShards.add(1), 10), player.constantUpgrades[5]), 2, true)}`,
    6: () => `+ ${format(2 * player.constantUpgrades[6])} free Ant Levels`,
    7: () => `+${format(7 * player.constantUpgrades[7])} free Rune Levels, +${format(3 * player.constantUpgrades[7])} to Rune Cap`,
    8: () => `Rune EXP x${format(1 + 1 / 10 * player.constantUpgrades[8], 2, true)}`,
    9: () => `Runes effectiveness x${format(1 + 0.01 * Math.log(player.talismanShards + 1) / Math.log(4) * Math.min(1, player.constantUpgrades[9]), 4, true)}`,
    10: () => `Cubes/Tesseracts on Ascension x${format(1 + 0.01 * Decimal.log(player.ascendShards.add(1), 4) * Math.min(1, player.constantUpgrades[10]), 4, true)}`
}

// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
const returnConstUpgDesc = (i: number) => i18next.t(`upgrades.constantUpgrades.${i}`, constantUpgDesc[i]?.())
// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
const returnConstUpgEffect = (i: number) => constUpgEffect[i]?.();

export const getConstUpgradeMetadata = (i: number): [number, Decimal] => {
    const toBuy = Math.max(0, Math.floor(1 + Decimal.log(Decimal.max(0.01, player.ascendShards), 10) - Math.log(G['constUpgradeCosts'][i]!) / Math.log(10)));
    let cost: Decimal

    if (toBuy > player.constantUpgrades[i]!) {
        cost = Decimal.pow(10, toBuy - 1).times(G['constUpgradeCosts'][i]!)
    } else {
        cost = Decimal.pow(10, player.constantUpgrades[i]!).times(G['constUpgradeCosts'][i]!)
    }

    return [Math.max(1, toBuy - player.constantUpgrades[i]!), cost]
}

export const constantUpgradeDescriptions = (i: number) => {
    const [level, cost] = getConstUpgradeMetadata(i)
    DOMCacheGetOrSet('constUpgradeDescription').textContent = returnConstUpgDesc(i)
    DOMCacheGetOrSet('constUpgradeLevel2').textContent = format(player.constantUpgrades[i])
    DOMCacheGetOrSet('constUpgradeCost2').textContent = format(cost) + ' [+' + format(level) + ' LVL]'
    DOMCacheGetOrSet('constUpgradeEffect2').textContent = returnConstUpgEffect(i)
}

export const buyConstantUpgrades = (i: number, fast = false) => {
    const [level, cost] = getConstUpgradeMetadata(i)
    if (player.ascendShards.gte(cost)) {
        player.constantUpgrades[i]! += level;
        if (player.researches[175] === 0) {
            player.ascendShards = player.ascendShards.sub(cost);
        }
        if (!fast) {
            constantUpgradeDescriptions(i);
        }
    }
    calculateAnts();
    calculateRuneLevels();
}
