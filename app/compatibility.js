const validCode = /^[AC][QT][SF][OP]$/;

const names = {
  A: "Alone",
  C: "Collaborative",
  Q: "Quiet",
  T: "Talkative",
  S: "Scheduled",
  F: "Flexible",
  O: "Organised",
  P: "Procrastinating",
};

const axisRules = [
  {
    key: "company",
    mismatchCost: 1,
    note: (first, second, same) => same
      ? `You both prefer ${names[first].toLowerCase()} study time.`
      : "One of you prefers solo focus; the other gets momentum from collaboration.",
    agreement: "Choose whether this is a solo, paired, or hybrid session before you start.",
  },
  {
    key: "energy",
    mismatchCost: 2,
    note: (first, second, same) => same
      ? `Your ${names[first].toLowerCase()} energy is naturally in sync.`
      : "One of you processes quietly; the other thinks best out loud.",
    agreement: "Set explicit quiet blocks and talk-it-out breaks so neither person has to guess.",
  },
  {
    key: "rhythm",
    mismatchCost: 1,
    note: (first, second, same) => same
      ? "Your planning rhythms line up without much negotiation."
      : "One of you wants a plan; the other needs room to adapt it.",
    agreement: "Agree on the finish line first, then leave the route flexible enough for both people.",
  },
];

export function isStudyCode(value) {
  return validCode.test(value);
}

export function allCodes() {
  return ["A", "C"].flatMap((one) =>
    ["Q", "T"].flatMap((two) =>
      ["S", "F"].flatMap((three) => ["O", "P"].map((four) => `${one}${two}${three}${four}`)),
    ),
  );
}

function momentumDimension(first, second) {
  if (first === "O" && second === "O") {
    return {
      key: "momentum",
      setupCost: 0,
      needsAgreement: false,
      note: "You both build momentum early and reliably.",
      agreement: "Leave some space for revision instead of turning an early start into over-planning.",
    };
  }

  if (first === "P" && second === "P") {
    return {
      key: "momentum",
      setupCost: 2,
      needsAgreement: true,
      note: "You share a sprint instinct, which can be energising and risky at the same time.",
      agreement: "Create a real mid-point deadline outside the final due date.",
    };
  }

  return {
    key: "momentum",
    setupCost: 1,
    needsAgreement: true,
    note: "One person creates runway; the other can bring useful endgame focus.",
    agreement: "Let the organiser set the first checkpoint and the sprinter own a defined final push.",
  };
}

export function getCompatibility(first, second) {
  if (!isStudyCode(first) || !isStudyCode(second)) {
    throw new Error("Compatibility requires two valid four-letter Studyprint codes.");
  }

  const dimensions = axisRules.map((rule, index) => {
    const same = first[index] === second[index];
    return {
      key: rule.key,
      setupCost: same ? 0 : rule.mismatchCost,
      needsAgreement: !same,
      note: rule.note(first[index], second[index], same),
      agreement: rule.agreement,
    };
  });
  dimensions.push(momentumDimension(first[3], second[3]));

  const setupCost = dimensions.reduce((total, dimension) => total + dimension.setupCost, 0);
  const agreements = dimensions.filter((dimension) => dimension.needsAgreement);
  const firstAgreement = agreements
    .slice()
    .sort((firstDimension, secondDimension) => secondDimension.setupCost - firstDimension.setupCost)[0];
  const agreementCount = agreements.length;

  return {
    setupCost,
    agreementCount,
    label: setupCost === 0 ? "Naturally aligned" : setupCost === 1 ? "Easy session setup" : setupCost <= 3 ? "A little setup helps" : "Clear rules recommended",
    summary: firstAgreement
      ? `Your best starting point: ${firstAgreement.agreement}`
      : "Your habits line up naturally. Choose one shared goal so the session still has direction.",
    notes: dimensions.map((dimension) => dimension.note),
    dimensions,
  };
}
