const game = {
	gameStage: 2,
	unlockStage: 0,
	tickSpeed: ddbnum.new(1),
	tickSpeedIsFunSoIMadeItABigNumber: true
}

const stage0 = {
	value: ddbnum.new(0),
	power: ddbnum.new(1),
	powerCost: ddbnum.new(15),
	generation: ddbnum.new(1),
	generationCost: ddbnum.new(15),
	generationCostAdd: ddbnum.new(5),
	getGenerationCost: function() {
		return this.generationCost.add(this.generationCostAdd.mult(this.generation.sub(1)))
	}
}

const stage1 = {
	values: [ddbnum.new(0), ddbnum.new(1)],
	height: 1,
	maxHeight: 2,
	minHeight: 0,
	bottomCost: ddbnum.new(1e3),
	getBottomCost: function() {
		return this.bottomCost.exp(1 - this.minHeight)
	},
	topCost: ddbnum.new(6),
	getTopCost: function(n) {
		return this.topCost.exp((n + 1) / 2)
	},
	costCost: ddbnum.new(1e6),
	getCostCost: function() {
		return this.costCost.exp(ddbnum.sub(7, this.topCost))
	},
	power: ddbnum.new(1),
	powerCost: ddbnum.new(1e4),
	powerCostMult: ddbnum.new(10),
	getPowerCost: function() {
		return this.powerCost.mult(this.powerCostMult.exp(this.power.sub(1)))
	},
	names: [        "displacement", "velocity", "acceleration", "jolt",   "snap",   "crackle",  "pop",   "lock",   "drop"],
	negativeNames: ["absement",     "absity",   "abseleration", "absolt", "absnap", "absackle", "absop", "absock", "absrop"]
}

function getProgress() {
	let progress = 0
	switch (game.gameStage) {
	case 0:
		progress = (stage0.value.num() / 100)**0.25 * (100 / 100**0.25)
		break
	case 1:
		progress = Math.log(Math.max(1, (stage1.values[stage1.minHeight] || ddbnum.new(0)).exp(1/18).num())) * (100 / Math.log(100))
		break
	}
	return Math.min(progress, 100)
}

function getTime() {
	return (new Date()).getTime()
}

function getValueName(n) {
	return (n >= 0 ? stage1.names[n] : stage1.negativeNames[-1 - n]) || ` m/s^${n}`
}

function capitalize(string) {
	return string.charAt(0).toUpperCase() + string.slice(1)
}

{
	function increaseValue() {
		if (game.gameStage !== 0) return
		stage0.value = ddbnum.add(stage0.value, stage0.power)
	}

	function increasePower() {
		if (game.gameStage !== 0 || game.unlockStage < 1) return
		if (stage0.value.under(stage0.powerCost)) return
		stage0.value = ddbnum.sub(stage0.value, stage0.powerCost)
		stage0.power = ddbnum.add(stage0.power, stage0.generation)
	}

	function increaseGeneration() {
		if (game.gameStage !== 0 || game.unlockStage < 2) return
		let generationCost = stage0.getGenerationCost()
		if (!stage0.power.over(generationCost)) return
		stage0.power = ddbnum.sub(stage0.power, generationCost)
		stage0.generation = ddbnum.add(stage0.generation, 1)
	}

	function increaseValue1(n) {
		if (game.gameStage !== 1) return
		let available = stage1.values[n - 1].div(stage1.getTopCost(n)).min(stage1.power)
		if (available.under(1)) return
		stage1.values[n - 1] = ddbnum.sub(stage1.values[n - 1], stage1.getTopCost(n).mult(available))
		stage1.values[n] = ddbnum.add(stage1.values[n], available)
	}

	function addTopLayer() {
		if (game.gameStage !== 1 || game.unlockStage < 1) return
		if (!stage1.values[stage1.maxHeight] || stage1.values[stage1.maxHeight].under(stage1.getTopCost(stage1.maxHeight + 1))) return
		stage1.values = [ddbnum.new(0), ddbnum.new(1)]
		stage1.height = 1
		stage1.maxHeight++
		resetStage1()
	}

	function addBottomLayer() {
		if (game.gameStage !== 1 || game.unlockStage < 2) return
		if (stage1.values[stage1.minHeight].under(stage1.getBottomCost())) return
		stage1.values = [ddbnum.new(0), ddbnum.new(1)]
		stage1.height = 1
		stage1.minHeight--
		resetStage1()
	}

	function upgradeBuying() {
		if (game.gameStage !== 1 || game.unlockStage < 3) return
		if (stage1.values[stage1.minHeight].under(stage1.getPowerCost())) return
		stage1.power = stage1.power.add(1)
	}

	function decreaseCost() {
		if (game.gameStage !== 1 || game.unlockStage < 3) return
		if (!stage1.topCost.over(1) || stage1.values[stage1.minHeight].under(stage1.getCostCost())) return
		stage1.topCost = stage1.topCost.sub(1)
	}

	function progressStage() {
		if (getProgress() < 100) return
		game.gameStage++
		game.unlockStage = 0
	}
}

document.getElementById("baseSlider").oninput = function() {
	let base = this.value
	let name = {2: "binary", 3: "ternary", 6: "sexary", 8: "octal", 10: "decimal", 12: "duodecimal", 16: "hexadecimal"}[base]
	name = base + (name ? ` (${name})` : "")
	document.getElementById("base").innerText = name
	ddbnamesettings.base = base
}