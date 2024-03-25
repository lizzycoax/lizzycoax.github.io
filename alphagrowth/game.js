//values

player = {
	alpha: new Big(10),
	growerAmounts: [new Big(0), new Big(0), new Big(0), new Big(0)]
};

//functions

setText = (name, text) =>
	document.getElementById(name).innerText = text;

setHTML = (name, html) =>
	document.getElementById(name).innerHTML = html;

setBut = (name, enab) =>
	(but =>
		enab ?
			but.removeAttribute("disabled") :
			but.setAttribute("disabled", null)
	)(document.getElementById(name));

amoPerStep = step =>
	player.growerAmounts.reduce((add, _, i) =>
		add.add(growerProd(i))
	, new Big(0)).mul(step);

growerCost = i =>
	new Big(10);

growerMult = i =>
	new Big(1);

growerProd = i =>
	player.growerAmounts[i + 1].mul(growerMult(i + 1));

grower = i =>
	(amo =>
		amo.gte(0) && (
			player.alpha = amo,
			player.growerAmounts[i] = player.growerAmounts[i].add(1)
		)
	)(player.alpha.sub(growerCost(i)));

//buttons

grower1 = () =>
	grower(0);

grower2 = () =>
	grower(1);

grower3 = () =>
	grower(2);

grower4 = () =>
	grower(3);

//updates

updateVariables = step =>
	player.growerAmounts.forEach((_, i) => (
		(i =>
			(add =>
				i == -1 ?
					player.alpha = player.alpha.add(add) :
					player.growerAmounts[i] = player.growerAmounts[i].add(add)
			)(growerProd(i).mul(step))
		)(i - 1)
	));

updateVisuals = () => (
	setText("amount", bignot(player.alpha)),
	player.growerAmounts.forEach((_, i) => (
		setText("growerAmo" + (i + 1), bignot(player.growerAmounts[i])),
		setText("growerCost" + (i + 1), bignot(growerCost(i))),
		setText("growerMult" + (i + 1), bignot(growerMult(i))),
		setText("growerProd" + (i), bignot(growerProd(i - 1))),
		setBut("growerBut" + (i + 1), player.alpha.sub(growerCost(i)).gte(0))
	))
);

gameLoop = then =>
	(now => (
		updateVariables((now - then) / 1000),
		updateVisuals(),
		setTimeout(gameLoop, 1000 / 60, now)
	))(Date.now());

gameLoop(Date.now());