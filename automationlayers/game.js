const game = {
	gameStage: 0,
	unlockStage: 0,
	tickSpeed: new ddbnum(1)
}

const stage0 = {
	value: new ddbnum(0),
	power: new ddbnum(1),
	powerCost: new ddbnum(15),
	generation: new ddbnum(1),
	generationCost: new ddbnum(15),
	generationCostAdd: new ddbnum(5),
	getGenerationCost: function() {
		return this.generationCost.add(this.generationCostAdd.mult(this.generation.sub(1)))
	}
}

const stage1 = {
	values: [new ddbnum(0), new ddbnum(1)],
	height: 1,
	maxHeight: 2,
	minHeight: 0,
	bottomCost: new ddbnum(1e3),
	getBottomCost: function() {
		return this.bottomCost.exp(1 - this.minHeight)
	},
	topCost: new ddbnum(6),
	getTopCost: function(n) {
		return this.topCost.exp((n + 1) / 2)
	},
	costCost: new ddbnum(1e6),
	getCostCost: function() {
		return this.costCost.exp(ddbops.sub(7, this.topCost))
	},
	power: new ddbnum(1),
	powerCost: new ddbnum(1e4),
	powerCostMult: new ddbnum(10),
	getPowerCost: function() {
		return this.powerCost.mult(this.powerCostMult.exp(this.power.pre()))
	},
	names: ["displacement", "velocity", "acceleration", "jolt", "snap", "crackle", "pop", "lock", "drop"],
	negativeNames: ["absement", "absity", "abseleration", "absolt", "absnap", "absackle", "absop", "absock", "absrop"]
}

const stage2 = {
	value: new ddbnum(10),
	upgrades: [new ddbnum(1)],
	upgradeCosts: [new ddbnum(10)],
	getUpgradeCost: function(n) {
		return this.upgradeCosts[n].exp(this.upgrades[n])
	}
}

function getProgress() {
	let progress = 0
	switch (game.gameStage) {
	case 0:
		progress = (stage0.value.num() / 100) ** (1/3) * (100 / 100 ** (1/3))
		break
	case 1:
		progress = Math.log(Math.max(1, (stage1.values[stage1.minHeight] || new ddbnum(0)).exp(1 / 18).num())) * (100 / Math.log(100))
		break
	}
	return Math.min(progress, 100)
}

function getTime() {
	return (new Date()).getTime()
}

function getValueName(n) {
	if (n === stage1.minHeight) return "value"
	return (n >= 0 ? stage1.names[n] : stage1.negativeNames[-n - 1]) || ` m/s^${n}`
}

function capitalize(string) {
	return string.charAt(0).toUpperCase() + string.slice(1)
}

{
	//stage 0 button functions
	function increaseValue() {
		if (game.gameStage !== 0) return
		stage0.value = stage0.value.add(stage0.power)
	}
	
	function increasePower() {
		if (game.gameStage !== 0 || game.unlockStage < 1) return
		if (stage0.value.under(stage0.powerCost)) return
		stage0.value = stage0.value.sub(stage0.powerCost)
		stage0.power = stage0.power.add(stage0.generation)
	}
	
	function increaseGeneration() {
		if (game.gameStage !== 0 || game.unlockStage < 2) return
		let generationCost = stage0.getGenerationCost()
		if (!stage0.power.over(generationCost)) return
		stage0.power = stage0.power.sub(generationCost)
		stage0.generation = stage0.generation.suc()
	}
	
	//stage 1 button functions
	function increaseValue1(n) {
		if (game.gameStage !== 1) return
		let available = stage1.values[n - 1].div(stage1.getTopCost(n)).min(stage1.power)
		if (available.under(1)) return
		stage1.values[n - 1] = stage1.values[n - 1].sub(stage1.getTopCost(n).mult(available))
		stage1.values[n] = stage1.values[n].add(available)
	}
	
	function addTopLayer() {
		if (game.gameStage !== 1 || game.unlockStage < 1) return
		if (!stage1.values[stage1.maxHeight] || stage1.values[stage1.maxHeight].under(stage1.getTopCost(stage1.maxHeight + 1))) return
		stage1.values = [new ddbnum(0), new ddbnum(1)]
		stage1.height = 1
		stage1.maxHeight++
		resetStage1()
	}
	
	function addBottomLayer() {
		if (game.gameStage !== 1 || game.unlockStage < 2) return
		if (stage1.values[stage1.minHeight].under(stage1.getBottomCost())) return
		stage1.values = [new ddbnum(0), new ddbnum(1)]
		stage1.height = 1
		stage1.minHeight--
		resetStage1()
	}
	
	function upgradeBuying() {
		if (game.gameStage !== 1 || game.unlockStage < 3) return
		if (stage1.values[stage1.minHeight].under(stage1.getPowerCost())) return
		stage1.power = stage1.power.suc()
	}
	
	function decreaseCost() {
		if (game.gameStage !== 1 || game.unlockStage < 3) return
		if (!stage1.topCost.over(1) || stage1.values[stage1.minHeight].under(stage1.getCostCost())) return
		stage1.topCost = stage1.topCost.pre()
	}
	
	//stage 2 button functions
	function operateMK(n) {
		let upgrade = stage2.upgrades[n]
		stage2.value = stage2.value.exp(upgrade.inv()).add(1).exp(upgrade)
	}
	
	function upgradeMK(n) {
		let upgradeCost = stage2.getUpgradeCost(n)
		if (stage2.value.under(upgradeCost)) return
		stage2.upgrades[n] = stage2.upgrades[n].suc()
		stage2.value = stage2.value.div(upgradeCost)
	}
	
	//progress button function
	function progressStage() {
		if (getProgress() < 100) return
		game.gameStage++
		game.unlockStage = 0
	}
}

document.getElementById("baseSlider").oninput = function() {
	let base = this.value
	let name = {
		2: "binary",
		3: "ternary",
		6: "sexary",
		8: "octal",
		10: "decimal",
		12: "duodecimal",
		16: "hexadecimal"
	}[base]
	name = base + (name ? ` (${name})` : "")
	document.getElementById("base").innerText = name
	ddbnamesettings.base = base
}
