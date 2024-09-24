/*
	Start values at low, let player make them high
	
	Value A: Amount
	Value B: Growth
	Value C: Speed
	Value D: Progress
	
	Base = [(a...), b..., [1, c..., [1, d...]]]
	a: dimensions
	b: hyperdimensions
	c: omega dimensions
	d: hydra dimensions
	
	first dimension increases power
	dimensions make the previous
	first hyperdimension recurses power
	hyperdimensions recurse the previous
	hyperpower is amount of hyperdimensions
	omega position is amounts of omega dimensions
	each omega position has hyperpower
	omega positions recurse hyperpower of previous first omega dimension
	omega positions starting with zero recurse omega dimension of last consecutive zero
	omega power is amount of omega dimensions
	hydra position is amount of hydra dimensions
	each hydra position has omega power
	hydra positions recurse omega power of previous omega dimension
	hydra positions starting with zero recurse hydra dimension of last consecutive zero
	
	sequence A
	spend input to upgrade and increase dimensions
	repeat
	spend last dimension to increase power
	repeat
	
	sequence B
	shift for hyperdimension with previous hyperdimensions
	repeat
	spend nth hyperdimension to lower threshold of hyperdimension shift
	repeat
	
	sequence C
	shift for first omega dimension with hyperpower
	repeat
	spend first omega dimension to lower threshold of hyperpower shift
	repeat
	
	sequence D
	shift for omega dimension with previous omega dimension
	repeat
	spend nth omega dimension to lower threshold of omega dimension shift
	repeat
	
	sequence E
	shift for first hydra dimension with omega power
	repeat
	spend first hydra dimension to lower threshold of omega power shift
	repeat
	
	sequence F
	shift for hydra dimension with previous hydra dimension
	repeat
*/

best = new Big(0);
power = new Big(0);
powerPost = new Big(0);
dimensionCount = 0;
dimensions = [];
dimensionsPost = [];
dimensionMults = [];
hyperdimensions = [];
postHyper = false;
postOmega = false;
postHydra = false;
view = 0;

frame = 0;

setText = (txt, str) =>
	txt.innerHTML != str && (txt.innerHTML = str);

setEnabled = (btn, enab) =>
	btn.disabled = !enab;

setShown = (elem, enab) =>
	elem.hidden = !enab;

output = () =>
	!postHyper ? power.flr() :
	hyperdimensions.reduce((output, r, i) =>
		output.fgh(i + 2, r),
	powerPost.flr());

hyperpower = () =>
	new Big(hyperdimensions.length);

changeView = n =>
	view = n;

/*ADD DIMENSION*/

addDimensionCost = () =>
	dimensionCount == 0 ? "free" : dimensionCount == 10 ? "locked" : [
		dimensionCount - 1,
		new Big(10)
	];

addDimension = () => (
	/*((cost) =>
		cost != "free" && (dimensions[cost[0]] = dimensions[cost[0]].sub(cost[1]))
	)(addDimensionCost()),*/
	dimensionCount += 1,
	dimensionCount <= 10 && (
		dimensions[dimensionCount - 1] = new Big(0),
		dimensionsPost[dimensionCount - 1] = new Big(0),
		dimensionMults[dimensionCount - 1] = new Big(1)
	)
)

addDimensionEvent = () =>
	((cost) =>
		cost == "free" || cost != "locked" && dimensionMults[cost[0]].gte(cost[1])
	)(addDimensionCost()) && addDimension();

dimensionMult = n =>
	dimensionMults[n].div(10).flr();

/*UPGRADE*/

upgradeDimensionCost = n =>
	Big.pow(10, dimensionMult(n - 1).mul(2 + n).add(((n + 0.5)**2 - 0.25) / 2));

upgradeDimensionMax = n =>
	dimensionMults[n - 1].div(10).add(1).flr().mul(10).sub(dimensionMults[n - 1]);

upgradeDimensionAmount = n =>
	power.div(upgradeDimensionCost(n)).flr().max(1).min(upgradeDimensionMax(n));

upgradeDimension = n =>
	(amount => (
		power = power.sub(upgradeDimensionCost(n).mul(amount)),
		dimensionMults[n - 1] = dimensionMults[n - 1].add(amount)
	))(upgradeDimensionAmount(n));

upgradeDimensionEvent = n =>
	n == null ? dimensions.forEach((x, i) => upgradeDimensionEvent(i + 1)) :
	dimensionMults[n - 1].gt(0) &&
		power.gte(upgradeDimensionCost(n)) && upgradeDimension(n);

/*HYPERSHIFT*/

hypershift = n => (
	n == 1 && (postHyper = true),
	powerPost = new Big(0),
	dimensionsPost = dimensionsPost.map(() => new Big(0)),
	hyperdimensions = hyperdimensions.map((x, i) => i >= n - 1 ? x : new Big(0)),
	hyperdimensions[n - 1] = (hyperdimensions[n - 1] || new Big(0)).add(1)
);

hypershiftEvent = () =>
	hypershift(hyperdimensions.length + 1);

/*UPDATE*/

updateValues = t => (
	dimensions.forEach((x, i) =>
		(i =>
			i < dimensions.length - 1 && (
				dimensions[i] =
					dimensions[i].add(
						dimensions[i + 1].add(dimensionMults[i + 1]).mul(
							dimensionMult(i + 1).exp(2)
						).mul(t)
					)
			)
		)(dimensions.length - 1 - i)
	),
	dimensions.length > 0 && (
		power = power.add(dimensions[0].add(dimensionMults[0]).mul(
			dimensionMult(0).exp(2)).mul(t)
		)
	),
	postHyper && (
		dimensionsPost.forEach((x, i) =>
			(i =>
				i < dimensionsPost.length - 1 && (
					dimensionsPost[i] =
						dimensionsPost[i].add(
							dimensionsPost[i + 1].add(dimensionMults[i + 1]).mul(
								dimensionMult(i + 1).exp(2)
							).mul(t)
						)
				)
			)(dimensionsPost.length - 1 - i)
		),
		dimensionsPost.length > 0 && (
			powerPost = powerPost.add(dimensionsPost[0].add(dimensionMults[0]).mul(
				dimensionMult(0).exp(2)).mul(t)
			)
		),
		powerPost.gte([53, 1]) && hyperdimensions.forEach((x, i) =>
			(i == 0 || hyperdimensions[i - 1].gte(10)) && hypershift(i + 1)
		)
	),
	best = best.max(output())
);

updateGuiForm = () => (
	document.getElementById("dimensions").style.width =
		view == 0 ? "100%" : !postOmega ? "50%" : !postHydra ? "33.33%" : "25%",
	setShown(document.getElementById("output segment"), postHyper),
	setShown(document.getElementById("hyperdimensions"), view == 1),
	setShown(document.getElementById("omega dimensions"), view == 1 && postOmega),
	setShown(document.getElementById("hydra dimensions"), view == 1 && postHydra),
	postHyper && (document.getElementById("hyperdimensions").style.width =
		!postOmega ? "50%" : !postHydra ? "33.33%" : "25%"),
	postOmega && (document.getElementById("omega dimensions").style.width =
		!postHydra ? "33.33%" : "25%")
);

updateValuesGui = () => (
	setText(
		document.getElementById("power"),
		(view == 0 ? power : powerPost).str()
	),
	postHyper && setText(document.getElementById("output"), output().str(true)),
	postHyper && setText(document.getElementById("best"), best.str(true)),
	postHyper && setText(
		document.getElementById("hyperpower"),
		hyperpower().str(true)
	),
	(powerGoal => (
		!powerGoal && setText(
			document.getElementById("power goal"),
			Big.str([53, 1])
		),
		setShown(
			document.getElementById("power goal text"),
			!postHyper && !powerGoal
		),
		setShown(
			document.getElementById("dimensions hypershift button"),
			!postHyper && powerGoal
		)
	))(power.gte([53, 1]))
);

updateDimensionsGui = () => (
	setText(
		document.getElementById("add dimension cost"),
		(cost =>
			cost == "locked" ? "locked" :
			cost == "free" ? "cost: free!" :
			"cost: " + cost[1].str() +
			" dimension " + (cost[0] == 8 ? "θ" : cost[0] + 1) + "'s"
		)(addDimensionCost())
	),
	setEnabled(
		document.getElementById("add dimension button"),
		(cost =>
			cost == "free" || cost != "locked" && dimensionMults[cost[0]].gte(cost[1])
		)(addDimensionCost())
	),
	setShown(document.getElementById("dimension top buttons"), view == 0),
	document.getElementById("dimension top text").style.color = [
		"#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff"
	][(frame + 5) % 6],
	dimensions.forEach((x, i) =>
		(enab => (
			setShown(document.getElementById("dimension " + (i + 1)), enab),
			enab && (
				setShown(
					document.getElementById("dimension upgrade " + (i + 1)),
					view == 0
				),
				setText(
					document.getElementById("dimension amount " + (i + 1)),
					dimensionMults[i].str(true) + (
						(view == 0 ? dimensions : dimensionsPost)[i].eq(0) ? "" :
							" + " + (view == 0 ? dimensions : dimensionsPost)[i].str()
					)
				),
				setText(
					document.getElementById("dimension upgrade button " + (i + 1)),
					"cost: " +
					upgradeDimensionCost(i + 1).str() +
					(mul =>
						mul == 1 ? "" : "×" + mul
					)(upgradeDimensionAmount(i + 1)) +
					" power"
				),
				setText(
					document.getElementById("dimension mult " + (i + 1)),
					"x" + dimensionMult(i).exp(2).str()
				),
				setEnabled(
					document.getElementById("dimension upgrade button " + (i + 1)),
					power.gte(upgradeDimensionCost(i + 1))
				),
				document.getElementById("dimension " + (i + 1)).style.color = [
					"#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff"
				][(frame + i) % 6]
			)
		))(dimensionMults[i].gt(0))
	)
);

updateHyperdimensionsGui = () => (
	hyperdimensions.forEach((x, i) => (
		setShown(document.getElementById("hyperdimension " + (i + 1)), true),
		setText(
			document.getElementById("hyperdimension amount " + (i + 1)),
			hyperdimensions[i].str(true)
		),
		document.getElementById("hyperdimension " + (i + 1)).style.color = [
			"#ff0000", "#ffff00", "#00ff00", "#00ffff", "#0000ff", "#ff00ff"
		][(frame + i) % 6]
	)),
	setShown(
		document.getElementById("hyperdimensions hypershift button"),
		hyperdimensions.at(-1).gte(10)
	)
),

update = t => (
	frame = (frame + 1) % (24 * 60),
	updateValues(t),
	updateGuiForm(),
	updateValuesGui(),
	updateDimensionsGui(),
	postHyper && updateHyperdimensionsGui()
);

gameLoop = then =>
	(now => (
		update((now - then) / 1000),
		setTimeout(gameLoop, 1000/24, now)
	))(Date.now());

gameLoop(Date.now());
