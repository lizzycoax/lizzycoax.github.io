const ddbnamesettings = {
	base: 10
}

{
	let t, k, m
	
	function round(n, precision) {
		precision /= n
		let decimals = Math.round(Math.log(precision) / Math.log(t))
		precision = t**decimals
		if (!precision) return n
		return Math.floor(n * precision + 0.000001) / precision
	}
	
	let getIllion
	{
		const units = ["nil", "m", "b", "tr", "quadr", "quint", "sext", "sept", "oct", "non"]
		const unitsPrefix = ["nil", "un", "duo", "tre", "quattuor", "quin", "sex", "septen", "octa", "novem"]
		const tens = ["nil", "dec", "vigint", "trigint", "quadragint", "quinquagint", "sexagint", "septuagint", "octogint", "nonagint"]
		const hundreds = ["nil", "cent", "ducent", "tregent", "quadringent", "quingent", "sesgent", "septingent", "octingent", "nongent"]
		const units2 = ["nil", "mill", "micr", "nan", "pic", "femt", "att", "zept", "ront", "quect"]
		
		function threeDigitPrefix(n, prefix) {
			let unit = units[n % 10]
			let unitPrefix = unitsPrefix[n % 10]
			let ten = tens[Math.floor(n / 10) % 10]
			let hundred = hundreds[Math.floor(n / 100)]
			
			if (n < 10)
				return prefix ? unitPrefix : unit
			if (n < 100) {
				if (unitPrefix === "nil")
					return ten
				return unitPrefix + ten
			}
			if (unitPrefix === "nil" && ten === "nil")
				return hundred
			if (ten === "nil")
				return unitPrefix + hundred
			if (unitPrefix === "nil")
				return ten + "a" + hundred
			return unitPrefix + ten + "a" + hundred
		}
		
		function sixDigitPrefix(n, prefix) {
			let unit = threeDigitPrefix(n % 1000, prefix)
			let thousand = threeDigitPrefix(Math.floor(n / 1000) % 1000, true)
			if (thousand === "un") thousand = ""
			if (Math.floor(n / 1000) % 1000 >= 10) thousand += "a"
			
			if (thousand === "nil")
				return unit
			if (unit === "nil")
				return thousand + "mor"
			return thousand + "mor" + unit
		}
		
		function getPrefix(n1, n1b) {
			let nValue = n1 * m ** n1b
			
			if (nValue === 0) return ""
			
			let name = null
			
			while (n1 > 0 && n1b >= 0) {
				let number = sixDigitPrefix(Math.floor(n1 + 1/m))
				let prefix = sixDigitPrefix(Math.floor(n1b), true)
				let prefix2 = units2[1]
				if (prefix !== "nil")
					prefix = prefix === "un" ? prefix2 : prefix + (n1b < t ? "" : "a") + prefix2
				if (number !== "nil") {
					name = ((number === "m" && prefix !== "nil") ? "" : number) +
					(prefix === "nil" ? "" : (number === "m" ? "" : "i") + prefix) +
					(name === null ? "" : "o" + name)
				}
				n1b--
				n1 = n1 * m % m
			}
			
			return name !== "nil" ? name : ""
		}
		
		getIllion = function(n, precision) {
			let nMag = Math.floor(Math.log(Math.max(1, n)) / Math.log(m))
			n = round(n / m ** nMag, precision)
			let one = (n % k).toString(t).toUpperCase()
			let thousand = Math.floor(n / k).toString(t).toUpperCase()
			let illion = getPrefix(nMag, 0)
			if (illion)
				illion = ` ${illion}illion`
			if (thousand !== "0")
				while (one.split(".")[0].length < 3)
					one = `0${one}`
			thousand = thousand !== "0" ? thousand + " " : ""
			return thousand + one + illion
		}
	}
	
	function ddbname(n, precision) {
		t = ddbnamesettings.base
		k = t**3
		m = k**2
		
		let num = (n.type === "ddbnum" ? n.bas : n)
		if (num === 0) return ""
		let sign = num < 0
		if (sign) num *= -1
		let inverse = num < 1 / m
		if (inverse) num **= -1
		if (!precision) num = Math.floor(num)
		return `${sign ? "-" : ""}${inverse ? "1 / " : ""}${getIllion(num, precision)}`
	}
}