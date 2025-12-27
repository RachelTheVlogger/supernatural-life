import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Heart } from 'lucide-react';

export default function MasturbationSlider({ onFinish, gender = 'custom', context = 'private', vampireName = null }) {
  // context: 'private', 'vampire', 'audience', 'videocall', 'sexting', 'fantasy'
  const [intensity, setIntensity] = useState(0);
  const [edging, setEdging] = useState(false);
  const [particles, setParticles] = useState([]);
  const [particleId, setParticleId] = useState(0);
  const [moans, setMoans] = useState([]);
  const [lastIntensity, setLastIntensity] = useState(0);
  const [edgeCount, setEdgeCount] = useState(0);
  const [desperationLevel, setDesperationLevel] = useState(0);
  const [selectedBodyPart, setSelectedBodyPart] = useState(null);
  const [touchingMultiple, setTouchingMultiple] = useState(false);
  const [denialStreak, setDenialStreak] = useState(0);
  const [riskLevel, setRiskLevel] = useState(0);
  const [heartRate, setHeartRate] = useState(60);
  const [timePressure, setTimePressure] = useState(null);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [stamina, setStamina] = useState(100);
  const [sweatLevel, setSweatLevel] = useState(0);
  const [interruptionEvent, setInterruptionEvent] = useState(null);
  const [performanceRank, setPerformanceRank] = useState(null);
  const vampireWatching = context === 'vampire';

  // Gender-specific body parts and positions
  const getBodyParts = () => {
    if (context === 'vampire') {
      // During sex with vampire - position options
      if (gender === 'woman') {
        return [
          { id: 'ride', label: '🔥 Ride Them', emoji: '💎' },
          { id: 'thrust', label: '💦 They Thrust Into You', emoji: '💦' },
          { id: 'oral', label: '👅 Give Oral', emoji: '👅' },
          { id: 'receive', label: '💋 Receive Oral', emoji: '💋' }
        ];
      } else if (gender === 'man') {
        return [
          { id: 'thrust', label: '🍆 Thrust Into Them', emoji: '🍆' },
          { id: 'receive', label: '💦 They Ride You', emoji: '💦' },
          { id: 'oral', label: '👅 Give Oral', emoji: '👅' },
          { id: 'receive_oral', label: '💋 Receive Oral', emoji: '💋' }
        ];
      } else {
        return [
          { id: 'penetrate', label: '🔥 Penetrate Them', emoji: '💎' },
          { id: 'receive', label: '💦 They Penetrate You', emoji: '💦' },
          { id: 'oral', label: '👅 Give Oral', emoji: '👅' },
          { id: 'mutual', label: '💋 Mutual Pleasure', emoji: '💋' }
        ];
      }
    } else {
      // Solo masturbation
      if (gender === 'woman') {
        return [
          { id: 'clit', label: '✨ Rub Clit', emoji: '💎' },
          { id: 'breasts', label: '🍒 Touch Breasts', emoji: '🍒' },
          { id: 'fingers', label: '👆 Finger Yourself', emoji: '💦' },
          { id: 'multiple', label: '🔥 Multiple Spots', emoji: '🔥' }
        ];
      } else if (gender === 'man') {
        return [
          { id: 'dick', label: '🍆 Stroke Dick', emoji: '🍆' },
          { id: 'chest', label: '💪 Touch Chest', emoji: '💪' },
          { id: 'balls', label: '🥜 Play with Balls', emoji: '⚡' },
          { id: 'multiple', label: '🔥 Multiple Spots', emoji: '🔥' }
        ];
      } else {
        return [
          { id: 'primary', label: '💎 Primary Spot', emoji: '💎' },
          { id: 'chest', label: '💗 Chest/Breasts', emoji: '💗' },
          { id: 'secondary', label: '✨ Secondary Spot', emoji: '✨' },
          { id: 'multiple', label: '🔥 Multiple Spots', emoji: '🔥' }
        ];
      }
    }
  };

  const getBodyPartMoans = (level, bodyPart, isEdging, isDecreasing) => {
    const isMale = gender === 'man';
    const isFemale = gender === 'woman';
    const isSex = context === 'vampire';

    if (isDecreasing && level > 10) {
      if (isSex) {
        if (bodyPart === 'ride') return isFemale ? 
          ['ahh slowing down...', 'need more...', 'legs shaking...', 'so deep...'] :
          ['ngh...', 'keep riding...', 'don\'t stop...', 'fuck...'];
        if (bodyPart === 'thrust') return isFemale ?
          ['slower now...', 'ahh...', 'need it harder...', 'please...'] :
          ['ngh pulling back...', 'fuck...', 'need to go deeper...', 'so tight...'];
        if (bodyPart === 'oral') return ['mmm...', 'keep going...', 'more...', 'don\'t stop...'];
        if (bodyPart === 'receive' || bodyPart === 'receive_oral') return ['ahh...', 'so good...', 'more...', 'please...'];
      }
      if (bodyPart === 'clit' || bodyPart === 'primary') {
        return ['nnngh...!', 'ahh so sensitive...', '*whimper* need more...', 'don\'t stop...'];
      } else if (bodyPart === 'dick') {
        return ['fuck...!', 'ahh so hard...', '*groan* need it...', 'come on...'];
      } else if (bodyPart === 'fingers') {
        return ['ngh need them deeper...', 'ahh empty...', 'fuck put them back...'];
      }
      return ['nnngh...!', 'ahh...', '*whimper*'];
    }

    if (isEdging && level > 60) {
      if (context === 'vampire') {
        return ['PLEASE LET ME!', 'I NEED IT SO BAD!', 'CAN I FINISH PLEASE?!', 'PLEASE I\'M SO CLOSE!'];
      } else if (context === 'videocall') {
        return ['Can I cum for you?!', 'Please let me finish!', 'I\'m so close!', 'Please please!'];
      } else if (context === 'audience') {
        return ['SHOULD I CUM?!', 'EDGE OR FINISH?!', 'CHAT DECIDE!', 'I CAN\'T HOLD IT!'];
      } else if (context === 'sexting') {
        return ['fuck I\'m so close', 'gonna cum thinking of you', 'can\'t hold back', 'about to explode'];
      }
      return ['OH FUCK I\'M SO CLOSE!', 'GONNA CUM SO HARD!', 'CAN\'T HOLD IT!'];
    }

    // Sex position specific moans
    if (isSex) {
      if (bodyPart === 'ride') {
        if (isFemale) {
          if (level < 20) return ['mmm...', 'oh...', 'ahh...', 'riding...'];
          if (level < 40) return ['bouncing on them...', 'feels so good...', 'mmm yes...', 'going deeper...'];
          if (level < 60) return ['RIDING HARD!', 'OH GOD!', 'SO DEEP!', 'YES!'];
          if (level < 80) return ['FUCK YES!', 'BOUNCING SO HARD!', 'SO GOOD!', 'LEGS SHAKING!'];
          return ['CUMMING WHILE RIDING!', 'FUCK!', 'AHHH!', 'WE\'RE BOTH CUMMING!'];
        } else {
          if (level < 20) return ['mmm...', 'riding them...', 'ahh...', 'so tight...'];
          if (level < 40) return ['bouncing on them...', 'so wet inside...', 'mmm...', 'fuck...'];
          if (level < 60) return ['RIDING HARD!', 'SO TIGHT!', 'FUCK!', 'YES!'];
          if (level < 80) return ['GONNA CUM!', 'SO DEEP IN THEM!', 'FUCK YES!', 'AHHH!'];
          return ['CUMMING!', 'FUCK!', 'WE\'RE BOTH CUMMING!', 'AHHH!'];
        }
      } else if (bodyPart === 'thrust') {
        if (isFemale) {
          if (level < 20) return ['ahh...', 'they\'re pushing in...', 'oh...', 'mmm...'];
          if (level < 40) return ['thrusting into me...', 'feels so good...', 'deeper...', 'yes...'];
          if (level < 60) return ['FUCK ME!', 'HARDER!', 'OH GOD!', 'POUND ME!'];
          if (level < 80) return ['FUCK YES!', 'SO DEEP!', 'DON\'T STOP!', 'HARDER!'];
          return ['CUMMING TOGETHER!', 'FUCK!', 'YES YES YES!', 'BOTH CUMMING!'];
        } else {
          if (level < 20) return ['mmm...', 'pushing in...', 'so tight...', 'ahh...'];
          if (level < 40) return ['thrusting deep...', 'so wet...', 'fuck...', 'yes...'];
          if (level < 60) return ['POUNDING THEM!', 'SO TIGHT!', 'FUCK!', 'YES!'];
          if (level < 80) return ['GONNA CUM!', 'FILLING YOU!', 'FUCK YES!', 'SO TIGHT!'];
          return ['CUMMING INSIDE!', 'FUCK!', 'WE\'RE BOTH CUMMING!', 'AHHH!'];
        }
      } else if (bodyPart === 'oral') {
        if (level < 20) return ['mmm...', 'licking...', 'tasting...', 'ahh...'];
        if (level < 40) return ['tastes so good...', 'mmm yes...', 'sucking...', 'fuck...'];
        if (level < 60) return ['SO GOOD!', 'LOVE YOUR TASTE!', 'MMM!', 'YES!'];
        if (level < 80) return ['GONNA MAKE YOU CUM!', isFemale ? 'SO WET!' : 'SO HARD!', 'FUCK YES!', 'MMM!'];
        return ['CUM FOR ME!', 'YES!', 'YOU\'RE CUMMING!', 'AHHH!'];
      } else if (bodyPart === 'receive' || bodyPart === 'receive_oral') {
        if (level < 20) return ['mmm...', 'their tongue...', 'ahh...', 'yes...'];
        if (level < 40) return ['licking me...', 'so good...', 'more...', 'fuck...'];
        if (level < 60) return ['OH GOD!', 'RIGHT THERE!', 'FUCK!', 'YOUR TONGUE!'];
        if (level < 80) return ['GONNA CUM!', 'DON\'T STOP!', 'SO CLOSE!', 'FUCK YES!'];
        return ['CUMMING!', 'FUCK!', 'AHHH!', 'YES YES!'];
      } else if (bodyPart === 'penetrate') {
        if (level < 20) return ['inside them...', 'so tight...', 'mmm...', 'pushing in...'];
        if (level < 40) return ['fucking them...', 'so good...', 'deeper...', 'yes...'];
        if (level < 60) return ['SO TIGHT!', 'FUCK!', 'GOING DEEP!', 'YES!'];
        if (level < 80) return ['GONNA CUM!', 'FILLING THEM!', 'FUCK YES!', 'POUNDING!'];
        return ['CUMMING INSIDE!', 'FUCK!', 'WE\'RE BOTH CUMMING!', 'BREEDING THEM!'];
      } else if (bodyPart === 'mutual') {
        if (level < 20) return ['together...', 'mmm...', 'both feeling it...', 'ahh...'];
        if (level < 40) return ['touching each other...', 'so good...', 'yes...', 'mmm...'];
        if (level < 60) return ['SO GOOD!', 'TOGETHER!', 'FUCK!', 'BOTH CLOSE!'];
        if (level < 80) return ['BOTH SO CLOSE!', 'FUCK YES!', 'TOGETHER!', 'AHHH!'];
        return ['CUMMING TOGETHER!', 'BOTH AT ONCE!', 'FUCK!', 'YES!'];
      }
    }
    
    // Fantasy moans when alone thinking about vampire
    if (context === 'fantasy' && vampireName) {
      if (bodyPart === 'clit' || bodyPart === 'primary') {
        if (level < 20) return ['mmm... thinking of them...', `wish ${vampireName} was here...`, 'ahh...'];
        if (level < 40) return [`${vampireName}...`, 'want them so bad...', 'need them...', 'fuck...'];
        if (level < 60) return [`${vampireName} PLEASE!`, 'WANT THEM TO BITE ME!', 'NEED THEM!', 'FUCK!'];
        if (level < 80) return [`${vampireName}!`, 'BITE ME WHILE I CUM!', 'TAKE ME!', 'MAKE ME YOURS!'];
        return [`CUMMING FOR ${vampireName}!`, 'FUCK!', 'WANT THEM SO BAD!', 'AHHH!'];
      } else if (bodyPart === 'dick') {
        if (level < 20) return ['mmm... thinking of them...', `wish ${vampireName} was here...`, 'so hard...'];
        if (level < 40) return [`${vampireName}...`, 'want them to suck me...', 'need them...', 'fuck...'];
        if (level < 60) return [`${vampireName} PLEASE!`, 'WANT THEM ON ME!', 'NEED THEM!', 'SO HARD!'];
        if (level < 80) return [`${vampireName}!`, 'FUCK MY MOUTH!', 'USE ME!', 'PLEASE!'];
        return [`CUMMING FOR ${vampireName}!`, 'FUCK!', 'AHHH!', 'YES!'];
      } else if (bodyPart === 'fingers') {
        if (level < 20) return ['mmm...', `imagining ${vampireName}\'s fingers...`, 'ahh...'];
        if (level < 40) return ['want them inside me...', `${vampireName}...`, 'need them...'];
        if (level < 60) return ['NEED THEM INSIDE ME!', `${vampireName} PLEASE!`, 'FUCK ME!'];
        if (level < 80) return ['FILL ME UP!', `${vampireName}!`, 'NEED YOU!', 'FUCK!'];
        return [`CUMMING FOR ${vampireName}!`, 'FUCK!', 'AHHH!', 'YES!'];
      } else if (bodyPart === 'dildo') {
        if (level < 20) return [`pretend it is ${vampireName}...`, 'pushing it in...', 'ahh...'];
        if (level < 40) return [`fucking myself pretending it is ${vampireName}...`, 'need them...', 'so deep...'];
        if (level < 60) return [`PRETEND IT IS ${vampireName}!`, 'FUCK ME!', 'NEED THEM!'];
        if (level < 80) return [`${vampireName} FUCK ME!`, 'PRETENDING IT IS YOU!', 'NEED YOUR COCK!'];
        return [`CUMMING ON IT THINKING OF ${vampireName}!`, 'FUCK!', 'WISH IT WAS YOU!'];
      } else if (bodyPart === 'vibrator') {
        if (level < 20) return [`wish it was ${vampireName}...`, 'buzzing...', 'ahh...'];
        if (level < 40) return [`thinking of ${vampireName}...`, 'so good...', 'need them...'];
        if (level < 60) return [`${vampireName}!`, 'WISH YOU WERE HERE!', 'NEED YOU!'];
        if (level < 80) return [`${vampireName} PLEASE!`, 'VIBRATOR SO GOOD!', 'WANT YOU!'];
        return [`CUMMING FOR ${vampireName}!`, 'WISH IT WAS YOU!', 'FUCK!'];
      } else if (bodyPart === 'fleshlight') {
        if (level < 20) return [`imagining ${vampireName}...`, 'so tight...', 'ahh...'];
        if (level < 40) return [`pretending it is ${vampireName}...`, 'feels good...', 'need them...'];
        if (level < 60) return [`PRETEND IT IS ${vampireName}!`, 'SO TIGHT!', 'NEED YOU!'];
        if (level < 80) return [`${vampireName}!`, 'WISH IT WAS YOUR PUSSY!', 'FUCK!'];
        return [`CUMMING THINKING OF ${vampireName}!`, 'WISH YOU WERE HERE!', 'AHHH!'];
      } else if (bodyPart === 'oral_toy') {
        if (level < 20) return [`wish it was ${vampireName} mouth...`, 'ahh...', 'feels good...'];
        if (level < 40) return [`pretending it is ${vampireName} sucking me...`, 'mmm...', 'need them...'];
        if (level < 60) return [`PRETEND IT IS ${vampireName}!`, 'SUCK ME!', 'NEED YOUR MOUTH!'];
        if (level < 80) return [`${vampireName} PLEASE!`, 'WISH IT WAS YOU!', 'SUCK ME!'];
        return [`CUMMING FOR ${vampireName}!`, 'WISH IT WAS YOUR MOUTH!', 'FUCK!'];
      } else if (bodyPart === 'toy') {
        if (level < 20) return [`thinking of ${vampireName}...`, 'toy feels good...', 'ahh...'];
        if (level < 40) return [`wish it was ${vampireName}...`, 'mmm...', 'need them...'];
        if (level < 60) return [`${vampireName}!`, 'NEED YOU!', 'TOY SO GOOD!'];
        if (level < 80) return [`${vampireName} PLEASE!`, 'WANT YOU!', 'FUCK!'];
        return [`CUMMING FOR ${vampireName}!`, 'WISH YOU WERE HERE!', 'AHHH!'];
      }
      // Default fantasy moans
      if (level < 20) return ['mmm...', `${vampireName}...`, 'ahh...'];
      if (level < 40) return [`want ${vampireName}...`, 'need them...', 'fuck...'];
      if (level < 60) return [`${vampireName} PLEASE!`, 'NEED THEM!', 'FUCK!'];
      if (level < 80) return [`${vampireName}!`, 'TAKE ME!', 'BITE ME!', 'AHHH!'];
      return [`CUMMING FOR ${vampireName}!`, 'FUCK!', 'YES!', 'AHHH!'];
    }

    // Sex position specific moans
    if (isSex) {
      if (bodyPart === 'ride') {
        if (isFemale) {
          if (level < 20) return ['mmm...', 'oh...', 'ahh...', 'yes...'];
          if (level < 40) return ['bouncing on them...', 'feels so good...', 'mmm yes...', 'going deeper...'];
          if (level < 60) return ['RIDING hard!', 'OH GOD!', 'SO DEEP!', 'YES!'];
          if (level < 80) return ['FUCK YES!', 'BOUNCING SO HARD!', 'SO GOOD!', 'LEGS SHAKING!'];
          return ['CUMMING!', 'FUCK!', 'RIDING TILL I CUM!', 'AHHH!'];
        } else {
          if (level < 20) return ['mmm...', 'oh...', 'ahh...', 'yes...'];
          if (level < 40) return ['riding them...', 'so tight...', 'mmm...', 'fuck...'];
          if (level < 60) return ['RIDING hard!', 'SO TIGHT!', 'FUCK!', 'YES!'];
          if (level < 80) return ['GONNA CUM!', 'SO DEEP IN THEM!', 'FUCK YES!', 'AHHH!'];
          return ['CUMMING!', 'FUCK!', 'FILLING THEM UP!', 'AHHH!'];
        }
      } else if (bodyPart === 'thrust') {
        if (isFemale) {
          if (level < 20) return ['ahh...', 'they\'re inside...', 'oh...', 'mmm...'];
          if (level < 40) return ['thrusting into me...', 'feels so good...', 'deeper...', 'yes...'];
          if (level < 60) return ['FUCK ME!', 'HARDER!', 'OH GOD!', 'YES!'];
          if (level < 80) return ['FUCK YES!', 'SO DEEP!', 'DON\'T STOP!', 'HARDER!'];
          return ['CUMMING!', 'FUCK!', 'YES YES YES!', 'AHHH!'];
        } else {
          if (level < 20) return ['mmm...', 'inside them...', 'so tight...', 'ahh...'];
          if (level < 40) return ['thrusting deep...', 'so wet...', 'fuck...', 'yes...'];
          if (level < 60) return ['POUNDING!', 'SO TIGHT!', 'FUCK!', 'YES!'];
          if (level < 80) return ['GONNA CUM!', 'FILLING YOU UP!', 'FUCK YES!', 'SO TIGHT!'];
          return ['CUMMING!', 'FUCK!', 'FILLING YOU!', 'AHHH!'];
        }
      } else if (bodyPart === 'oral') {
        if (level < 20) return ['mmm...', 'sucking...', 'licking...', 'ahh...'];
        if (level < 40) return ['tastes so good...', 'mmm yes...', 'more...', 'fuck...'];
        if (level < 60) return ['SO GOOD!', 'LOVE THIS!', 'MMM!', 'YES!'];
        if (level < 80) return ['GONNA MAKE YOU CUM!', 'SO WET!', 'FUCK YES!', 'MMM!'];
        return ['CUM FOR ME!', 'YES!', 'MMM FUCK!', 'AHHH!'];
      } else if (bodyPart === 'receive' || bodyPart === 'receive_oral') {
        if (level < 20) return ['mmm...', 'feels good...', 'ahh...', 'yes...'];
        if (level < 40) return ['their tongue...', 'so good...', 'more...', 'fuck...'];
        if (level < 60) return ['OH GOD!', 'RIGHT THERE!', 'FUCK!', 'YES!'];
        if (level < 80) return ['GONNA CUM!', 'DON\'T STOP!', 'SO CLOSE!', 'FUCK YES!'];
        return ['CUMMING!', 'FUCK!', 'AHHH!', 'YES YES!'];
      } else if (bodyPart === 'penetrate') {
        if (level < 20) return ['inside them...', 'so tight...', 'mmm...', 'ahh...'];
        if (level < 40) return ['fucking them...', 'so good...', 'deeper...', 'yes...'];
        if (level < 60) return ['SO TIGHT!', 'FUCK!', 'GOING DEEP!', 'YES!'];
        if (level < 80) return ['GONNA CUM!', 'FILLING THEM!', 'FUCK YES!', 'AHHH!'];
        return ['CUMMING INSIDE!', 'FUCK!', 'AHHH!', 'YES!'];
      } else if (bodyPart === 'mutual') {
        if (level < 20) return ['together...', 'mmm...', 'both feeling it...', 'ahh...'];
        if (level < 40) return ['touching each other...', 'so good...', 'yes...', 'mmm...'];
        if (level < 60) return ['SO GOOD!', 'TOGETHER!', 'FUCK!', 'YES!'];
        if (level < 80) return ['BOTH SO CLOSE!', 'FUCK YES!', 'CUMMING TOGETHER!', 'AHHH!'];
        return ['CUMMING!', 'BOTH AT ONCE!', 'FUCK!', 'YES!'];
      }
    }

    // Body part specific moans - less repetitive
    if (bodyPart === 'clit' || bodyPart === 'primary') {
      if (level < 20) return ['mmm...', 'ahh...', 'oh fuck...', 'yes...'];
      if (level < 40) return ['yes...', 'god so good...', 'ahh right there...', 'mmm...'];
      if (level < 60) return ['FUCK!', 'YES harder!', 'OH GOD!', 'right there!'];
      if (level < 80) return ['SO GOOD!', 'FUCK YES!', 'GONNA CUM!', 'DON\'T STOP!'];
      return ['CUMMING!', 'AHHH!', 'YES YES YES!', 'FUCK!'];
    } else if (bodyPart === 'dick') {
      if (level < 20) return ['mmm...', 'fuck yeah...', 'so hard...', 'ahh...'];
      if (level < 40) return ['yes...', 'feels so good...', 'getting close...', 'fuck...'];
      if (level < 60) return ['FUCK!', 'SO HARD!', 'GONNA BLOW!', 'YES!'];
      if (level < 80) return ['SO CLOSE!', 'FUCK!', 'ABOUT TO CUM!', 'AHHH!'];
      return ['CUMMING!', 'FUCK YES!', 'SHOOTING!', 'AHHH!'];
    } else if (bodyPart === 'breasts' || bodyPart === 'chest') {
      if (level < 40) return ['mmm...', 'so sensitive...', 'ahh...', 'feels good...'];
      if (level < 70) return ['fuck!', 'yes!', 'so hard!', 'ahh!'];
      return ['FUCK!', 'YES!', 'AHHH!'];
    } else if (bodyPart === 'fingers') {
      if (level < 20) return ['mmm...', 'so tight...', 'going deeper...', 'ahh...'];
      if (level < 40) return ['yes...', 'fuck so wet...', 'more...', 'deeper...'];
      if (level < 60) return ['SO DEEP!', 'FUCK!', 'YES!'];
      if (level < 80) return ['SO WET!', 'GONNA CUM!', 'FUCK YES!'];
      return ['CUMMING!', 'FUCK!', 'AHHH!'];
    } else if (bodyPart === 'balls') {
      if (level < 40) return ['mmm...', 'feels good...', 'so full...', 'ahh...'];
      if (level < 70) return ['fuck!', 'so tight!', 'need to cum!', 'yes!'];
      return ['SO TIGHT!', 'GONNA EXPLODE!', 'FUCK!'];
    } else if (bodyPart === 'multiple' || touchingMultiple) {
      if (level < 40) return ['touching everywhere...', 'so much...', 'ahh...', 'fuck...'];
      if (level < 70) return ['BOTH at once!', 'TOO MUCH!', 'FUCK!', 'YES!'];
      return ['CUMMING everywhere!', 'AHHH!', 'FUCK YES!'];
    }

    // Default
    if (level < 20) return ['mmm...', 'ahh...', 'oh...'];
    if (level < 40) return ['yes...', 'god...', 'more...'];
    if (level < 60) return ['FUCK...', 'YES...', 'OH GOD...'];
    if (level < 80) return ['FUCK YES!', 'SO CLOSE!', 'DON\'T STOP!'];
    return ['CUMMING!', 'FUCK!', 'YES YES YES!'];
  };

  const getMoanText = (level, isEdging, isDecreasing, wasHigh) => {
    if (selectedBodyPart) {
      return getBodyPartMoans(level, selectedBodyPart, isEdging, isDecreasing);
    }
    
    // Original moans if no body part selected
    // Frustrated gasping/whimpering when pulling back at any intensity
    if (isDecreasing && level > 10) {
      return [
        'nnngh...!',
        'ahh... ahh...',
        '*whimper*',
        'hahh... hahh...',
        'mmnngh...',
        '*gasp*',
        'ahhn...',
        '*frustrated whimper*',
        'nngh... nngh...',
        '*breathless gasp*',
        'ahh...!',
        '*desperate whimper*'
      ];
    }
    
    // Context-aware desperate edging moans
    if (isEdging && level > 60) {
      const desperate = vampireWatching ? [
        'PLEASE LET ME...!',
        'CAN I CUM PLEASE?!',
        'I\'LL DO ANYTHING!',
        'PLEASE I NEED IT!',
        'LET ME FINISH PLEASE!'
      ] : [
        'OH GOD I CAN\'T...!',
        'I NEED TO CUM SO BAD!',
        'FUCK I\'M RIGHT THERE!',
        'I\'M GONNA EXPLODE!',
        'I CAN\'T HOLD IT!'
      ];
      return desperate;
    }
    
    // Gender-specific moans
    const isMale = gender === 'man';
    const isFemale = gender === 'woman';
    
    if (level < 20) {
      return isMale ? ['mmm...', 'ahh...', 'fuck...'] : 
             isFemale ? ['mmm...', 'oh...', 'ahhn...'] : 
             ['mmm...', 'ah...', 'oh...'];
    }
    
    if (level < 40) {
      return isMale ? ['fuck yeah...', 'mmm...', 'god...', 'ahh...'] : 
             isFemale ? ['yes...', 'mmm...', 'ahhn...', 'oh god...'] : 
             ['mmm...', 'ahh...', 'yes...', 'god...'];
    }
    
    if (level < 60) {
      return isMale ? ['shit...', 'fuck...', 'so good...', 'yeah...'] : 
             isFemale ? ['ohhh yes...', 'fuck...', 'right there...', 'more...'] : 
             ['ohhh...', 'fuck...', 'yes...', 'ahh...', 'more...'];
    }
    
    if (level < 80) {
      return isMale ? ['FUCK...', 'YES...', 'SHIT...', 'SO CLOSE...'] : 
             isFemale ? ['OH GOD...', 'YES YES...', 'FUCK...', 'DON\'T STOP...'] : 
             ['FUCK...', 'YES...', 'OH GOD...', 'AHHH...', 'DON\'T STOP...'];
    }
    
    return isMale ? ['FUCK YES!', 'GONNA CUM!', 'OH FUCK!', 'AHHH!'] : 
           isFemale ? ['OH FUCK!', 'I\'M CUMMING!', 'YES YES YES!', 'AHHHHH!'] : 
           ['FUCK YES!', 'OH FUCK!', 'I\'M SO CLOSE!', 'AHHHHH!', 'YES YES YES!'];
  };

  useEffect(() => {
    if (intensity > 10) {
      const interval = setInterval(() => {
        const shouldSpawn = Math.random() < (intensity / 100);
        if (shouldSpawn) {
          const newParticle = {
            id: particleId,
            type: Math.random() > 0.5 ? 'heart' : 'flame',
            x: Math.random() * 80 + 10,
            delay: 0
          };
          setParticles(prev => [...prev.slice(-15), newParticle]);
          setParticleId(prev => prev + 1);
        }
      }, intensity > 70 ? 100 : intensity > 50 ? 200 : 400);
      
      return () => clearInterval(interval);
    }
  }, [intensity, particleId]);

  // Haptic feedback
  const triggerHaptic = (strength = 'medium') => {
    if (navigator.vibrate) {
      const patterns = {
        light: [10],
        medium: [20],
        strong: [30],
        climax: [50, 50, 100]
      };
      navigator.vibrate(patterns[strength] || patterns.medium);
    }
  };

  // Stamina drain
  useEffect(() => {
    if (intensity > 70 && stamina > 0) {
      const drainRate = (intensity - 70) / 10;
      const interval = setInterval(() => {
        setStamina(prev => Math.max(0, prev - drainRate));
      }, 1000);
      return () => clearInterval(interval);
    } else if (intensity < 30 && stamina < 100) {
      const interval = setInterval(() => {
        setStamina(prev => Math.min(100, prev + 2));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [intensity, stamina]);

  // Sweat level
  useEffect(() => {
    const sweat = Math.floor((intensity + (100 - stamina)) / 2);
    setSweatLevel(sweat);
  }, [intensity, stamina]);

  // Random interruptions
  useEffect(() => {
    if (intensity > 50 && !interruptionEvent && Math.random() > 0.98) {
      const events = [
        { text: '🚪 Someone\'s at the door!', impact: 'risk' },
        { text: '📱 Phone ringing!', impact: 'distraction' },
        { text: '🔊 Noise outside!', impact: 'risk' },
        { text: '💬 Text notification!', impact: 'distraction' }
      ];
      setInterruptionEvent(events[Math.floor(Math.random() * events.length)]);
      setTimeout(() => setInterruptionEvent(null), 3000);
    }
  }, [intensity, interruptionEvent]);

  // Time pressure countdown
  useEffect(() => {
    if (timePressure && timeRemaining !== null) {
      if (timeRemaining <= 0) {
        handleFinish('ruined');
        return;
      }
      const timer = setInterval(() => {
        setTimeRemaining(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timePressure, timeRemaining]);

  // Show moans as slider moves
  const handleSliderChange = (value) => {
    const isDecreasing = value < lastIntensity;
    const wasHigh = lastIntensity > 60;
    
    // Stamina check - can't maintain max if exhausted
    if (stamina < 20 && value > 80) {
      value = 80;
    }
    
    setIntensity(value);
    setLastIntensity(value);
    
    // Update heart rate
    const baseRate = 60;
    const maxRate = 180;
    const newRate = Math.floor(baseRate + ((maxRate - baseRate) * (value / 100)));
    setHeartRate(newRate);
    
    // Haptic feedback at thresholds
    if (value > 70 && lastIntensity <= 70) triggerHaptic('medium');
    if (value > 85 && lastIntensity <= 85) triggerHaptic('strong');
    
    // Update risk level for public
    if (context === 'audience' || context === 'public') {
      setRiskLevel(Math.min(100, value + Math.random() * 20));
    }
    
    // Add moan immediately on movement
    if (value > 10 || isDecreasing) {
      const moanList = getMoanText(value, edging, isDecreasing, wasHigh);
      const randomMoan = moanList[Math.floor(Math.random() * moanList.length)];
      const newMoan = { id: Date.now() + Math.random(), text: randomMoan };
      setMoans(prev => [...prev.slice(-6), newMoan]);
    }
  };

  useEffect(() => {
    if (intensity > 20) {
      const interval = setInterval(() => {
        const isDecreasing = intensity < lastIntensity;
        const wasHigh = lastIntensity > 60;
        const moanList = getMoanText(intensity, edging, false, false);
        const randomMoan = moanList[Math.floor(Math.random() * moanList.length)];
        const newMoan = { id: Date.now() + Math.random(), text: randomMoan };
        setMoans(prev => [...prev.slice(-6), newMoan]);
      }, edging && intensity > 60 ? 300 : intensity > 70 ? 400 : intensity > 50 ? 800 : 1200);
      
      return () => clearInterval(interval);
    }
  }, [intensity, edging, lastIntensity]);

  const handleFinish = (type = 'finished') => {
    setIntensity(100);
    if (type === 'finished') {
      triggerHaptic('climax');
      
      // Calculate performance rank
      let score = 0;
      if (edgeCount > 0) score += edgeCount * 10;
      if (desperationLevel > 50) score += 20;
      if (stamina > 30) score += 15;
      if (type === 'finished') score += 30;
      
      let rank = 'D';
      if (score >= 100) rank = 'S';
      else if (score >= 80) rank = 'A';
      else if (score >= 60) rank = 'B';
      else if (score >= 40) rank = 'C';
      
      setPerformanceRank(rank);
    }
    setTimeout(() => {
      const finalType = edging ? 'edged' : type;
      onFinish(finalType, edgeCount, desperationLevel, selectedBodyPart, touchingMultiple);
    }, 1000);
  };

  // Visual effects based on intensity
  const screenShake = intensity > 80 ? (Math.sin(Date.now() / 50) * 2) : 0;
  const blurAmount = intensity > 70 ? Math.min((intensity - 70) / 30, 1) * 3 : 0;
  const colorIntensity = intensity / 100;
  const pulseSpeed = Math.max(0.5, 2 - (intensity / 50));
  const heatGlow = intensity > 60 ? `0 0 ${20 + intensity}px rgba(236, 72, 153, ${colorIntensity * 0.6})` : 'none';

  return (
    <div 
      className="relative bg-gradient-to-b from-pink-950/60 to-purple-950/60 rounded-2xl p-8 border-2 border-pink-500/50 overflow-hidden min-h-[500px]"
      style={{
        transform: `translate(${screenShake}px, ${screenShake}px)`,
        filter: `blur(${blurAmount}px) saturate(${1 + colorIntensity * 0.5}) hue-rotate(${colorIntensity * 10}deg)`,
        boxShadow: heatGlow,
        background: intensity > 70 
          ? `linear-gradient(to bottom, rgba(219, 39, 119, ${colorIntensity * 0.4}), rgba(168, 85, 247, ${colorIntensity * 0.4}))`
          : undefined
      }}
    >
      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <AnimatePresence>
          {particles.map(particle => (
            <motion.div
              key={particle.id}
              initial={{ y: '100%', x: `${particle.x}%`, opacity: 1, scale: 0.5 }}
              animate={{ y: '-20%', opacity: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 2, ease: 'easeOut' }}
              className="absolute bottom-0"
            >
              {particle.type === 'heart' ? (
                <Heart className="w-6 h-6 text-pink-400 fill-pink-400" />
              ) : (
                <Flame className="w-6 h-6 text-orange-400 fill-orange-400" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Sweat drops */}
      {sweatLevel > 30 && [...Array(Math.floor(sweatLevel / 15))].map((_, i) => (
        <motion.div
          key={`sweat-${i}`}
          className="absolute text-2xl pointer-events-none"
          initial={{ x: `${20 + i * 20}%`, y: '20%', opacity: 0 }}
          animate={{ y: '100%', opacity: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
        >
          💧
        </motion.div>
      ))}

      {/* Interruption events */}
      <AnimatePresence>
        {interruptionEvent && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-900/90 border-2 border-red-500 rounded-xl px-4 py-2 z-50"
          >
            <p className="text-white font-bold">{interruptionEvent.text}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Performance rank on finish */}
      <AnimatePresence>
        {performanceRank && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <div className="text-center">
              <p className={`text-9xl font-bold ${
                performanceRank === 'S' ? 'text-yellow-400' :
                performanceRank === 'A' ? 'text-green-400' :
                performanceRank === 'B' ? 'text-blue-400' :
                performanceRank === 'C' ? 'text-purple-400' :
                'text-gray-400'
              }`} style={{ textShadow: '0 0 30px currentColor' }}>
                {performanceRank}
              </p>
              <p className="text-white text-xl mt-4">Rank</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top stats bar */}
      <div className="absolute top-4 left-0 right-0 flex justify-between items-center px-4 pointer-events-none z-10">
        {/* Heart rate */}
        <motion.div 
          className="flex items-center gap-2 bg-black/50 rounded-full px-3 py-1"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 60 / heartRate, repeat: Infinity }}
        >
          <Heart className="w-4 h-4 text-red-500 fill-red-500" />
          <span className="text-white font-bold text-sm">{heartRate} BPM</span>
        </motion.div>

        {/* Stamina bar */}
        <motion.div className="bg-black/50 rounded-full px-3 py-1">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold ${stamina < 30 ? 'text-red-400' : stamina < 60 ? 'text-yellow-400' : 'text-green-400'}`}>
              💪 {Math.floor(stamina)}%
            </span>
          </div>
        </motion.div>

        {/* Risk meter for public contexts */}
        {(context === 'audience' || context === 'public') && (
          <motion.div className="bg-black/50 rounded-full px-3 py-1">
            <span className={`font-bold text-sm ${riskLevel > 70 ? 'text-red-400' : riskLevel > 40 ? 'text-yellow-400' : 'text-green-400'}`}>
              ⚠️ Risk: {Math.floor(riskLevel)}%
            </span>
          </motion.div>
        )}

        {/* Time pressure */}
        {timePressure && timeRemaining !== null && (
          <motion.div 
            className="bg-black/50 rounded-full px-3 py-1"
            animate={{ scale: timeRemaining < 10 ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.5, repeat: timeRemaining < 10 ? Infinity : 0 }}
          >
            <span className={`font-bold text-sm ${timeRemaining < 10 ? 'text-red-400' : 'text-white'}`}>
              ⏱️ {timeRemaining}s
            </span>
          </motion.div>
        )}
      </div>

      {/* Moaning text overlay */}
      <div className="absolute top-16 left-0 right-0 flex flex-col items-center gap-1 pointer-events-none">
        <AnimatePresence mode="popLayout">
          {moans.slice(-3).map((moan, i) => (
            <motion.p
              key={moan.id}
              initial={{ opacity: 0, y: 20, scale: 0.8 }}
              animate={{ opacity: 1 - (i * 0.3), y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`font-bold text-center ${
                intensity > 70 ? 'text-3xl text-pink-300' : 
                intensity > 50 ? 'text-2xl text-pink-400' : 
                'text-xl text-pink-500'
              }`}
              style={{ textShadow: '0 0 10px rgba(236, 72, 153, 0.5)' }}
            >
              {moan.text}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center h-full pt-20">
        {/* Body Part Selection */}
        {!selectedBodyPart && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h3 className="text-white text-lg font-bold mb-3 text-center">Where are you touching?</h3>
            <div className="grid grid-cols-2 gap-2">
              {getBodyParts().map(part => (
                <button
                  key={part.id}
                  onClick={() => {
                    setSelectedBodyPart(part.id);
                    setTouchingMultiple(part.id === 'multiple');
                  }}
                  className="bg-pink-900/40 hover:bg-pink-900/60 border-2 border-pink-500/50 rounded-xl py-3 px-4 text-white font-medium transition-all"
                >
                  {part.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {selectedBodyPart && (
          <>
            <motion.div
              animate={{ 
                scale: 1 + (intensity / 100) * 0.3,
                rotate: Math.sin(Date.now() / 200) * (intensity / 10)
              }}
              className="text-8xl mb-4"
            >
              {getBodyParts().find(p => p.id === selectedBodyPart)?.emoji || '💖'}
            </motion.div>
            <p className="text-pink-300 text-sm mb-6">
              {context === 'vampire' ? (
                selectedBodyPart === 'ride' ? (gender === 'woman' ? 'Riding them hard...' : 'Riding them...') :
                selectedBodyPart === 'thrust' ? (gender === 'woman' ? 'They\'re thrusting into you...' : 'Thrusting into them...') :
                selectedBodyPart === 'oral' ? (gender === 'woman' ? 'Sucking/licking them...' : 'Going down on them...') :
                selectedBodyPart === 'receive' ? (gender === 'woman' ? 'They\'re going down on you...' : 'They\'re riding you...') :
                selectedBodyPart === 'receive_oral' ? 'They\'re sucking you...' :
                selectedBodyPart === 'penetrate' ? 'Penetrating them...' :
                selectedBodyPart === 'mutual' ? 'Pleasuring each other...' :
                selectedBodyPart === 'clit' ? 'They\'re rubbing their clit...' :
                selectedBodyPart === 'dick' ? 'They\'re stroking their dick...' :
                selectedBodyPart === 'breasts' ? 'Playing with their breasts...' :
                selectedBodyPart === 'chest' ? 'Touching their chest...' :
                selectedBodyPart === 'fingers' ? 'Fingering themselves...' :
                selectedBodyPart === 'balls' ? 'Playing with their balls...' :
                selectedBodyPart === 'multiple' ? 'Touching everywhere...' :
                'Touching themselves for you...'
              ) : (
                selectedBodyPart === 'clit' ? 'Rubbing your clit...' :
                selectedBodyPart === 'dick' ? 'Stroking your dick...' :
                selectedBodyPart === 'breasts' ? 'Playing with your breasts...' :
                selectedBodyPart === 'chest' ? 'Touching your chest...' :
                selectedBodyPart === 'fingers' ? 'Fingering yourself...' :
                selectedBodyPart === 'balls' ? 'Playing with your balls...' :
                selectedBodyPart === 'multiple' ? 'Touching everywhere...' :
                'Touching yourself...'
              )}
            </p>
          </>
        )}

        {selectedBodyPart && (
          <div className="w-full max-w-md mb-6 relative">
            <div className="flex justify-between text-white mb-2">
              <span className="text-sm">Intensity</span>
              <span className="font-bold text-lg">{intensity}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="95"
              value={intensity}
              onChange={(e) => handleSliderChange(parseInt(e.target.value))}
              className="w-full h-3 bg-gray-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-pink-500 [&::-webkit-slider-thumb]:to-purple-500 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:shadow-lg"
              style={{
                background: `linear-gradient(to right, #ec4899 0%, #a855f7 ${intensity}%, #374151 ${intensity}%, #374151 100%)`
              }}
            />
            {/* Particle trail on slider */}
            {intensity > 20 && (
              <motion.div
                className="absolute top-8 pointer-events-none"
                style={{ left: `${intensity}%` }}
                animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.6, 1, 0.6] }}
                transition={{ duration: pulseSpeed, repeat: Infinity }}
              >
                <div className="w-4 h-4 bg-pink-500 rounded-full blur-sm" />
              </motion.div>
            )}
          </div>
        )}

        {/* Desperation & Denial Streak */}
        <div className="flex gap-3 mb-4 w-full max-w-md">
          {desperationLevel > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1"
            >
              <div className="flex justify-between text-xs text-pink-400 mb-1">
                <span>Desperation</span>
                <span>{desperationLevel}%</span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <motion.div 
                  animate={{ width: `${desperationLevel}%` }}
                  className="h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                />
              </div>
            </motion.div>
          )}

          {denialStreak > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-purple-900/60 rounded-lg px-3 py-2 border border-purple-500/30"
            >
              <p className="text-purple-300 text-xs font-bold">
                🚫 Denied: {denialStreak}x
              </p>
            </motion.div>
          )}
        </div>

        {selectedBodyPart && (
          <>
            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={() => {
                  setEdging(!edging);
                  if (!edging) {
                    setEdgeCount(prev => prev + 1);
                    setDesperationLevel(prev => Math.min(100, prev + 20));
                    triggerHaptic('medium');
                  }
                }}
                className={`px-6 py-3 rounded-xl font-medium transition-all ${
                  edging 
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white shadow-lg' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {edging ? `⚡ Edging... (${edgeCount}x)` : 'Edge'}
              </button>

              <button
                onClick={() => handleFinish('finished')}
                disabled={intensity < 50}
                className={`px-6 py-3 rounded-xl font-bold transition-all ${
                  intensity >= 50
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white shadow-lg'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                💦 Finish
              </button>

              {intensity >= 70 && edgeCount > 0 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => {
                    setDenialStreak(prev => prev + 1);
                    handleFinish('ruined');
                  }}
                  className="px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-gray-300 shadow-lg transition-all"
                >
                  💔 Ruin It
                </motion.button>
              )}

              {context === 'vampire' && intensity >= 60 && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => {
                    setIntensity(30);
                    setDesperationLevel(prev => Math.min(100, prev + 30));
                    setDenialStreak(prev => prev + 1);
                    triggerHaptic('light');
                  }}
                  className="px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-purple-900 to-purple-800 hover:from-purple-800 hover:to-purple-700 text-purple-200 shadow-lg transition-all"
                >
                  🧠 Denied (Telepathic)
                </motion.button>
              )}
            </div>

            <button
              onClick={() => {
                setSelectedBodyPart(null);
                setIntensity(0);
                setEdging(false);
                setTouchingMultiple(false);
              }}
              className="text-gray-400 hover:text-white text-sm mb-4"
            >
              ← Change spot
            </button>
          </>
        )}

        {intensity > 70 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 0.5, repeat: Infinity }}
            className="text-pink-400 font-bold text-lg"
          >
            {context === 'vampire' && edging ? 'Waiting for permission...' : 
             context === 'videocall' && edging ? 'Asking if you can finish...' :
             context === 'audience' && edging ? 'Chat voting...' :
             edging ? `Holding back... so close... (${edgeCount}x)` : 
             'Almost there...'}
          </motion.p>
        )}

        {context === 'vampire' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-purple-400 text-sm italic mt-2"
          >
            They're watching you...
          </motion.p>
        )}
        {context === 'fantasy' && vampireName && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-pink-400 text-sm italic mt-2"
          >
            🌙 Solo Session • Fantasizing about {vampireName}
          </motion.p>
        )}
        {context === 'audience' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-pink-400 text-sm italic mt-2"
          >
            🔴 LIVE • {Math.floor(Math.random() * 500) + 200} watching
          </motion.p>
        )}
        {context === 'videocall' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-400 text-sm italic mt-2"
          >
            📹 Private call • They're watching intently
          </motion.p>
        )}
        {context === 'sexting' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-purple-400 text-sm italic mt-2"
          >
            💬 Texting them what you're doing...
          </motion.p>
        )}

        {intensity < 50 && (
          <p className="text-gray-500 text-sm">Need 50% to finish</p>
        )}
      </div>
    </div>
  );
}