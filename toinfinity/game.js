//extra space because i cant handle actual code being on top aaaaahhhhh

//constants

crystalChange = [["exoticMatter", -1], ["cash", -2]];
crystalTime = 5;

//functions

changeValues = (prices, fake) =>
	((elems) =>
		((vals) =>
			vals.every((val, i) =>
				val >= 0
			) && (fake ||
				((newVals) => {
					elems.forEach((elem, i) => {
						elem.innerText = newVals[i];
					});
				})(vals),
			true)
		)(elems.map((elem, i) =>
			Number(elem.innerText) + prices[i][1]
		))
	)(prices.map((price) =>
		document.getElementById(price[0])
	));

updateAddCrystalButton = () => {
	((but) => {
		changeValues(crystalChange, true) ?
			but.removeAttribute("disabled") :
			but.setAttribute("disabled", "");
	})(document.getElementById("addCrystal"));
};

nextCrystalProgress = (val, time) =>
	Math.expm1(Math.log1p(val) + time / Math.LOG2E / crystalTime);

//events

startGame = () => {
	document.getElementById("startDiv").setAttribute("hidden", "");
	document.getElementById("gameDiv").removeAttribute("hidden");
};

addCrystal = () => {
	changeValues(crystalChange) &&
		((temp) => {
			temp.removeAttribute("id");
			temp.setAttribute("class", "crystalJar");
			document.getElementById("crystalJarDiv").appendChild(temp);
			temp.removeAttribute("hidden");
		})(document.getElementById("crystalJarTemplate").cloneNode(true));
	updateAddCrystalButton();
};

harvestCrystal = (but) => {
	changeValues([["exoticMatter", 1]]) &&
		((prog) => {
			Number(prog.getAttribute("value")) == Number(prog.getAttribute("max")) &&
				(() => {
					prog.setAttribute("value", 0);
					but.removeAttribute("disabled");
				})();
		})(but.parentElement.querySelector(".crystalProgress"));
	updateAddCrystalButton();
};

//updates

updateCrystals = (time) => {
	Array.from(document.getElementsByClassName("crystalJar")).forEach((elem) => {
		((prog, but) => {
			((val) => {
				prog.setAttribute("value", val);
				val == Number(prog.getAttribute("max")) ?
					but.removeAttribute("disabled") :
					but.setAttribute("disabled", "");
			})(Math.min(
				Number(prog.getAttribute("max")),
				nextCrystalProgress(Number(prog.getAttribute("value")), time)
			));
		})(
			elem.querySelector(".crystalProgress"),
			elem.querySelector(".harvestCrystal")
		);
	});
};

setInterval(() => {
	updateCrystals(1/60);
}, 1000/60);