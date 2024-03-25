$bigname = {
	units: [
		"", "mi", "bi", "tri", "quadri", "quinti", "sexti", "septi", "octi", "noni"
	],
	abbUnits: [
		"", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No"
	],
	joinUnits: [
		"", "un", "duo", "tre", "qua", "quin", "sexa", "septem", "octo", "novem"
	],
	tens: [
		"", "deci", "viginti", "ginti"
	],
	abbTen: "D",
	hundred: "centi",
	abbHundred: "C",
	tensFunc: (n, abb) =>
		!abb && n <= 2 ?
			$bigname.tens[n] :
		abb && n <= 1 ? (
			n == 0 ? "" : $bigname.abbTen
		) :
			$bigname[abb ? "abbUnits" : "joinUnits"][n] + (
				abb ?
					$bigname.abbTen :
					$bigname.tens[3]
			),
	hundredsFunc: (n, abb) =>
		(n < 1 ? "" :
			(n < 2 ? "" :
				$bigname[abb ? "abbUnits" : "units"][n]
			) +
			$bigname[abb ? "abbHundred" : "hundred"]
		),
	prefixFunc: (n, abb) =>
		$bigname.hundredsFunc(Math.floor(n / 100), abb) +
		(!abb && Math.floor(n / 10) % 10 == 1 ?
			$bigname.joinUnits[n % 10] + $bigname.tensFunc(1) :
			$bigname.tensFunc(Math.floor(n / 10) % 10, abb) +
			$bigname[abb ? "abbUnits" : "units"][n % 10]),
	expUnits: [
		"", "me", "due", "trie", "tetre", "pente", "hexe", "hepte", "octe", "enne"
	],
	abbExpUnits: [
		"", "Me", "De", "Te", "Tt", "Pe", "Hx", "Hp", "Oe", "Ee"
	],
	expPrefixFunc: (n, abb) =>
		$bigname[abb ? "abbExpUnits" : "expUnits"][n],
	max: new Big(1e3).exp(1e3).exp(1e3).exp(1e3).exp(1e3).exp(1e3)
		.exp(1e3).exp(1e3).exp(1e3).exp(1e3).exp(1e3)
};

bignotSettings = {
	name: true
};

bignot = (n, abb) =>
	(n =>
		n.str(abb ? 2 : 6)
	)(new Big(n));