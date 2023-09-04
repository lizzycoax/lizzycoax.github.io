{
	const previousGameValues = {
		gameStage: 0,
		unlockStage: 0,
		progressMet: false,
		time: getTime(),
		stage1Height: 1
	}
	
	function resetStage1() {
		document.getElementById("stage1Buttons").innerHTML =
			`<p><button onclick="increaseValue1(1)">Increase ${getValueName(1)}<br>
		Cost: <label id="value1_1Cost"></label> ${getValueName(0)}</button>
		${capitalize(getValueName(1))}: <label id="value1_1"></label></p>`
		document.getElementById("stage1Values").innerHTML = ""
		for (let i = stage1.minHeight; i <= 0; i++) {
			stage1.values[i] = new ddbnum(0)
			document.getElementById("stage1Values").innerHTML +=
				`<p>${capitalize(getValueName(i))}: <label id="value1_${i}"></label></p>`
		}
		previousGameValues.stage1Height = 1
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
			if (stage1.height < stage1.maxHeight && game.unlockStage > 0 && !(stage1.values[stage1.height].under(stage1.getTopCost(stage1.height + 1)))) {
				let height = stage1.height + 1
				stage1.values[height] = new ddbnum(0)
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
		let progressMet = progress === 100
		
		if (progressMet !== previousGameValues.progressMet) {
			if (progressMet) {
				document.getElementById("newStage").innerText = (game.gameStage + 1).toString()
				document.getElementById("progressButton").hidden = false
			} else document.getElementById("progressButton").hidden = true
			previousGameValues.progressMet = progressMet
		}
		if (game.gameStage !== previousGameValues.gameStage) {
			let newGameStage = Math.min(previousGameValues.gameStage + 1, game.gameStage)
			switch (newGameStage) {
			case 1:
				document.getElementById("stage0").hidden = true
				document.getElementById("stage1Left").hidden = false
				document.getElementById("stage1").hidden = false
				document.getElementById("stage1Right").hidden = false
				previousGameValues.unlockStage = 0
				resetStage1()
				break
			case 2:
				document.getElementById("stage1Left").hidden = true
				document.getElementById("stage1").hidden = true
				document.getElementById("stage1Right").hidden = true
				document.getElementById("stage2").hidden = false
				previousGameValues.unlockStage = 0
				break
			}
			previousGameValues.gameStage = newGameStage
		}
		if (game.unlockStage !== previousGameValues.unlockStage) {
			let newUnlockStage = Math.min(previousGameValues.unlockStage + 1, game.unlockStage)
			switch (game.gameStage) {
			case 0:
				switch (newUnlockStage) {
				case 1:
					document.getElementById("powerButton").hidden = false
					break
				case 2:
					document.getElementById("generationButton").hidden = false
					break
				}
				break
			case 1:
				switch (newUnlockStage) {
				case 1:
					document.getElementById("stage1Buttons").hidden = false
					break
				case 2:
					document.getElementById("stage1Resets").hidden = false
					break
				case 3:
					document.getElementById("stage1Upgrades").hidden = false
					break
				}
				break
			}
			previousGameValues.unlockStage = newUnlockStage
		}
		if (game.gameStage === 1 && stage1.height > previousGameValues.stage1Height) {
			for (let height = previousGameValues.stage1Height + 1; height <= stage1.height; height++) {
				document.getElementById("stage1Buttons").innerHTML +=
					`<p><button onclick="increaseValue1(${height})">Increase ${getValueName(height)}<br>
				Cost: <label id="value1_${height}Cost"></label> ${capitalize(getValueName(height - 1))}</button>
				${capitalize(getValueName(height))}: <label id="value1_${height}"></label></p>`
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
			document.getElementById("powerCost1").innerText = `${ddbname(stage1.getPowerCost(), 1000)} ${getValueName(stage1.minHeight)}`
			document.getElementById("power1").innerText = ddbname(stage1.power)
			document.getElementById("costCost1").innerText = `${ddbname(stage1.getCostCost(), 1000)} ${getValueName(stage1.minHeight)}`
			document.getElementById("cost1").innerText = ddbname(stage1.topCost)
		}
	}
	
	let updateStage2 = function(tick) {
		document.getElementById("value2").innerText = ddbname(stage2.value, 1000)
		document.getElementById("upgradeMK0Cost").innerText = ddbname(stage2.getUpgradeCost(0))
		document.getElementById("upgradeMK0Amount").innerText = ddbname(stage2.upgrades[0])
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
		case 2:
			updateStage2(tick)
		}
		
		document.getElementById("progressBar").value = progress
	}
	
	setInterval(update, 1000 / 24)
}
