//values

values = {
	crystals: 1,
	totalCrystals: 1,
	entropy: 1,
	entropyDecreasers: 0,
	matter: 0,
	stars: 0,
	antimatter: 0
};

matterGain = () =>
	$sub($inv(values.entropy), 1);

crystalCost = (totalCrystals) =>
	$sub($exp(2, $sub($exp(2, totalCrystals), 1)), 1);

starCost = () =>
	crystalCost($add(7, values.stars));

entropyInterval = () =>
	$mul($inv($add(values.stars, 1)), 10);

gainCrystalChange = (val) => [
	["crystals", $add(values.crystals, val)],
	["totalCrystals", $add(values.totalCrystals, val)]
];

entropyDecreaserChange = () => [
	["crystals", $sub(values.crystals, 1)],
	["entropyDecreasers", $add(values.entropyDecreasers, 1)]
];

concentrateEntropyChange = () => [
	["entropy", 1],
	["matter", $add(values.matter, matterGain())],
	["antimatter", $add(values.antimatter, matterGain())]
];

concentrateMatterChange = () => [
	["matter", $sub(values.matter, crystalCost(values.totalCrystals))],
	["crystals", $add(values.crystals, 1)],
	["totalCrystals", $add(values.totalCrystals, 1)]
];

formStarChange = () => [
	["crystals", 1],
	["totalCrystals", 1],
	["entropy", 1],
	["entropyDecreasers", 0],
	["matter", $min($sub(values.matter, starCost()), 0)],
	["stars", $add(values.stars, 1)]
];

//functions

setText = (name, text) => {
	((elem) => {
		elem && (() => {
			elem.innerText = text
		})();
	})(document.getElementById(name));
};

setEnabled = (name, on) => {
	((elem) => {
		on ?
			elem.removeAttribute("disabled") :
			elem.setAttribute("disabled", "")
	})(document.getElementById(name));
};

changeValues = (vals, fake) =>
	vals.every((val, i) =>
		$mte(val[1], 0)
	) && (fake ||
		vals.forEach((val, i) => {
			values[val[0]] = val[1];
			setText(val[0], $str(values[val[0]]));
			setText(val[0] + "Percent", $str($mul(values[val[0]], 100)) + "%");
		})
	, true);

gainCrystals = (val) =>
	changeValues(gainCrystalChange(val));

//events

buyEntropyDecreaserEv = () => {
	changeValues(entropyDecreaserChange());
};

concentrateEntropyEv = () => {
	changeValues(concentrateEntropyChange());
};

concentrateMatterEv = () => {
	changeValues(concentrateMatterChange());
};

formStarEv = () => {
	changeValues(formStarChange());
};

//updates

decreaseEntropy = (time) => {
	changeValues([["entropy",
		$exp(2,
			$sub(
				$log(2, values.entropy)
			, $mul(
				$div(values.entropyDecreasers, entropyInterval())
			, time))
		)
	]]);
};

updateCosts = () => {
	setText("entropyInterval", $str(entropyInterval()));
	setText("matterPreview", $str(matterGain()));
	setText("crystalCost", $str(crystalCost(values.totalCrystals)));
	setText("starCost", $str(starCost()));
	setEnabled(
		"buyEntropyDecreaser",
		changeValues(entropyDecreaserChange(), true)
	);
	setEnabled(
		"concentrateMatter",
		changeValues(concentrateMatterChange(), true)
	);
	setEnabled(
		"formStar",
		changeValues(formStarChange(), true)
	);
};

update = (then) => {
	((now) => {
		((time) => {
			decreaseEntropy(time);
			updateCosts();
		})((now - then) / 1000);
		setTimeout(() => {
			update(now);
		}, 1/24);
	})(Date.now());
};

update(Date.now());

//initialize

changeValues(Object.entries(values));
