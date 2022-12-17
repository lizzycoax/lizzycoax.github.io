const game = {
	gameStage: 0,
	unlockStage: 0,
	tickSpeed: ddbnum.new(1),
	tickSpeedIsFunSoIMadeItABigNumber: true
}
const stage0 = {
	value: ddbnum.new(10000),
	power: ddbnum.new(1),
	generation: ddbnum.new(1),
	powerCost: ddbnum.new(15),
	generationCost: ddbnum.new(15),
	generationCostAdd: ddbnum.new(5),
	getGenerationCost: function() {
		return this.generationCost.add(this.generationCostAdd.mult(this.generation.sub(1)))
	}
}
const stage1 = {
	values: [ddbnum.new(0), ddbnum.new(1), ddbnum.new(0), ddbnum.new(10000)],
	power: ddbnum.new(1),
	height: 3,
	maxHeight: 3,
	minHeight: -1,
	bottomCost: ddbnum.new(1e4),
	getBottomCost: function() {
		return this.bottomCost.exp(1 - this.minHeight)
	},
	topCost: ddbnum.new(9),
	getTopCost: function(n) {
		return this.topCost.exp((n + 1) / 2)
	},
	powerCost: ddbnum.new(1e8),
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
		progress = stage0.value.num()**0.25 * (10000 / 10000**0.25) * 100
		break
	case 1:
		progress = Math.log(Math.max(1, (stage1.values[stage1.minHeight] || ddbnum.new(0)).exp(0.1).num())) * (1000000 / Math.log(1000000))
		break
	}
	return Math.min(progress, 1000000)
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
	const previousGameValues = {
		gameStage: 0,
		unlockStage: 0,
		progressMet: false,
		time: getTime(),
		stage1Height: 1
	}
	
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
	
	let resetStage1 = function() {
		document.getElementById("stage1Buttons").innerHTML =
		`<p><button onclick="increaseValue1(1)">Increase ${getValueName(1)}<br>
		Cost: <label id="value1_1Cost"></label></button>
		${capitalize(getValueName(1))}: <label id="value1_1"></label></p>`
		document.getElementById("stage1Values").innerHTML = ""
		for (let i = stage1.minHeight; i <= 0; i++) {
			stage1.values[i] = ddbnum.new(0)
			document.getElementById("stage1Values").innerHTML +=
			`<p>${capitalize(getValueName(i))}: <label id="value1_${i}"></label></p>`
		}
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
		previousGameValues.stage1Height = 1
		resetStage1()
	}
	function addBottomLayer() {
		if (game.gameStage !== 1 || game.unlockStage < 2) return
		if (stage1.values[stage1.minHeight].under(stage1.getBottomCost())) return
		stage1.values = [ddbnum.new(0), ddbnum.new(1)]
		stage1.height = 1
		stage1.minHeight--
		previousGameValues.stage1Height = 1
		resetStage1()
	}
	function upgradeBuying() {
		if (game.gameStage !== 1 || game.unlockStage < 3) return
		if (stage1.values[stage1.minHeight].under(stage1.getPowerCost())) return
		stage1.power = stage1.power.add(1)
		for (let i = stage1.minHeight; i <= 0; i++)
			stage1.values[i] = stage1.values[i].exp(0.1)
	}
	function decreaseCost() {
		//if (game.gameStage !== 1 || game.unlockStage < 3) return
	}
	
	function progressStage() {
		if (getProgress() < 1000000) return
		game.gameStage++
		game.unlockStage = 0
		previousGameValues.unlockStage = 0
	}
	
	let updateStageData = function() {
		switch (game.gameStage) {
		case 0:
			switch (game.unlockStage) {
			case 0:
				if (stage0.value.under(stage0.powerCost)) break
				game.unlockStage = 1
				break
			case 1:
				if (stage0.power.under(stage0.generationCost)) break
				game.unlockStage = 2
				break
			}
			break
		case 1:
			if (stage1.height < stage1.maxHeight && game.unlockStage > 0 && !(stage1.values[stage1.height].under(stage1.getTopCost(stage1.maxHeight + 1)))) {
				let height = stage1.height + 1
				stage1.values[height] = ddbnum.new(0)
				stage1.height = height
			}
			switch (game.unlockStage) {
			case 0:
				if (stage1.values[0].under(stage1.getTopCost(1))) break
				game.unlockStage = 1
				break
			case 1:
				if ((!stage1.values[2] || stage1.values[2].under(stage1.getTopCost(3))) && stage1.values[0].under(stage1.bottomCost)) break
				game.unlockStage = 2
				break
			case 2:
				if (stage1.minHeight === 0 && stage1.maxHeight === 2) break
				game.unlockStage = 3
				break
			}
			break
		}
	}
	
	let updateDocument = function() {
		let progress = getProgress()
		let progressMet = progress === 1000000
		
		if (progressMet !== previousGameValues.progressMet) {
			if (progressMet) {
				document.getElementById("newStage").innerText = (game.gameStage + 1).toString()
				document.getElementById("progressButton").removeAttribute("hidden")
			}
			else document.getElementById("progressButton").setAttribute("hidden", "absolutely")
			previousGameValues.progressMet = progressMet
		} if (game.gameStage !== previousGameValues.gameStage) {
			let newGameStage = Math.min(previousGameValues.gameStage + 1, game.gameStage)
			switch (newGameStage) {
			case 1:
				document.getElementById("stage0").setAttribute("hidden", "totally")
				document.getElementById("stage1Left").removeAttribute("hidden")
				document.getElementById("stage1").removeAttribute("hidden")
				document.getElementById("stage1Right").removeAttribute("hidden")
				resetStage1()
				break
			case 2:
				document.getElementById("stage1Left").setAttribute("hidden", "totes")
				document.getElementById("stage1").setAttribute("hidden", "trueee")
				document.getElementById("stage1Right").setAttribute("hidden", "fr fr ong")
				document.getElementById("stage2").removeAttribute("hidden")
				break
			}
			previousGameValues.gameStage = newGameStage
		} if (game.unlockStage !== previousGameValues.unlockStage) {
			let newUnlockStage = Math.min(previousGameValues.unlockStage + 1, game.unlockStage)
			switch (game.gameStage) {
			case 0:
				switch (newUnlockStage) {
				case 1:
					document.getElementById("powerButton").removeAttribute("hidden")
					break
				case 2:
					document.getElementById("generationButton").removeAttribute("hidden")
					break
				}
				break
			case 1:
				switch (newUnlockStage) {
				case 1:
					document.getElementById("stage1Buttons").removeAttribute("hidden")
					break
				case 2:
					document.getElementById("stage1Resets").removeAttribute("hidden")
					break
				case 3:
					document.getElementById("stage1Upgrades").removeAttribute("hidden")
					break
				}
				break
			}
			previousGameValues.unlockStage = newUnlockStage
		} if (game.gameStage === 1 && stage1.height > previousGameValues.stage1Height) {
			for (let height = previousGameValues.stage1Height + 1; height <= stage1.height; height++) {
				let name = stage1.names[height]
				let capName = name.charAt(0).toUpperCase() + name.slice(1)
				document.getElementById("stage1Buttons").innerHTML +=
				`<p><button onclick="increaseValue1(${height})">Increase ${name}<br>
				Cost: <label id="value1_${height}Cost"></label></button>
				${capName}: <label id="value1_${height}"></label></p>`
			}
			
			previousGameValues.stage1Height = stage1.height
		}
	}
	
	let updateStage0 = function() {
		document.getElementById("value").innerText = ddbname(stage0.value)
		if (game.unlockStage > 0) {
			document.getElementById("power").innerText = ddbname(stage0.power)
			document.getElementById("powerCost").innerText = ddbname(stage0.powerCost)
		}
		if (game.unlockStage > 1) {
			document.getElementById("generation").innerText = ddbname(stage0.generation)
			document.getElementById("generationCost").innerText = ddbname(stage0.getGenerationCost())
		}
	}
	
	let updateStage1 = function(tick) {
		document.getElementById("value1_0").innerText = ddbname(stage1.values[0], 1000)
		for (let i = stage1.height; i > stage1.minHeight; i--) {
			stage1.values[i - 1] = stage1.values[i - 1].add(stage1.values[i].mult(tick))
		}
		if (game.unlockStage > 0) {
			for (let i = stage1.height; i >= stage1.minHeight; i--) {
				if (i === 0) continue
				document.getElementById(`value1_${i}`).innerText = ddbname(stage1.values[i], 1000)
				if (i > 0) document.getElementById(`value1_${i}Cost`).innerText = ddbname(stage1.getTopCost(i), 1000)
			}
		}
		if (game.unlockStage > 1) {
			document.getElementById("bottomCost").innerText = `${ddbname(stage1.getBottomCost(), 1000)} ${getValueName(stage1.minHeight)}`
			document.getElementById("topCost").innerText = `${ddbname(stage1.getTopCost(stage1.maxHeight + 1), 1000)} ${getValueName(stage1.maxHeight)}`
			document.getElementById("minHeight").innerText = ddbname(stage1.minHeight)
			document.getElementById("maxHeight").innerText = ddbname(stage1.maxHeight)
		}
		if (game.unlockStage > 2) {
			document.getElementById("powerCost1").innerText = `${ddbname(stage1.getPowerCost(), 1000)}`
		}
	}
	
	let update = function() {
		let progress = getProgress()
		let time = getTime()
		let tick = game.tickSpeed.mult((time - previousGameValues.time) / 1000)
		
		previousGameValues.time = time
		
		updateStageData()
		updateDocument()
		
		switch (game.gameStage) {
		case 0:
			updateStage0()
			break
		case 1:
			updateStage1(tick)
			break
		}
		
		document.getElementById("progressBar").value = progress / 10000
	}
	
	setInterval(update, 1000/24)
}

document.getElementById("baseSlider").oninput = function() {
	let base = this.value
	let name = {2: "binary", 3: "ternary", 6: "sexary", 8: "octal", 10: "decimal", 12: "duodecimal", 16: "hexadecimal"}[base]
	name = base + (name ? ` (${name})` : "")
	document.getElementById("base").innerText = name
	ddbnamesettings.base = base
}
