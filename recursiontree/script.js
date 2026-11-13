base = 0;
unlocked = 4;
last = 0;
machines = [];
dict = ["Ki", "Mi", "Gi", "Ti", "Pi", "Ei", "Zi", "Yi", "Ri", "Qi"];
left = 0;
right = 0;

persec = i =>
	5 ** i / 10 * 2 ** machines[i].t * (unlocked - 3);

format = x =>
(
	x < 1024 ? x % 1 == 0 ? x : x >= 100 ? Math.floor(x)
		: format(Math.floor(x)) + "." + format(Math.floor(x * 10 % 10))
		: format(x / 1024 ** Math.floor(Math.log(x) / Math.log(1024)))
		+ dict[Math.floor(Math.log(x) / Math.log(1024)) - 1]
);

enable = () =>
(
	machines.forEach((x, i) =>
	(
		base >= x.c ? x.buy.removeAttribute("disabled")
			: x.buy.setAttribute("disabled", true),
		base >= x.c2 ? x.tech.removeAttribute("disabled")
			: x.tech.setAttribute("disabled", true)
	))
);

unlock = i =>
	i <= 9 && machines[i] && machines[i].div.classList.remove("hidden");

display = d =>
(
	(x =>
	(
		number.innerHTML != x && base > last && (right = 1),
		number.innerHTML = x,
		chipdiv.setAttribute("style", `--l:${left};--r:${right}`),
		left = Math.max(0, left - d * 2),
		right = Math.max(0, right - d * 2),
		last = base
	)
	)(format(Math.floor(base))),
	nps.innerHTML = format(machines.map((x, i) => persec(i) * x.n)
		.reduce((x, y) => x + y, 0)) + "/s"
);

gain = d =>
(
	base += machines.map((x, i) => persec(i) * x.n)
		.reduce((x, y) => x + y, 0) * d
);

ngu.onclick = () => (base += unlocked - 3, gain(0.1), left = 1);

(f => f(f)(0)(0)(0))(f => b => l => t =>
	(gain(b / 1000), display(b / 1000), enable(),
		requestAnimationFrame(f(f)(t - l)(t))));

buy = i =>
(
	base -= machines[i].c, machines[i].n++,
	machines[i].c = Math.floor(10 ** (i + 1 + machines[i].n / 10)),
	machines[i].amount.innerHTML = format(machines[i].n),
	machines[i].cost.innerHTML = format(machines[i].c),
	machines[i].persec.innerHTML = format(persec(i) * machines[i].n),
	unlock(i + 1)
);

tech = (t, i) =>
(
	base -= machines[i].c2, machines[i].t++,
	machines[i].c2 = 10 ** (i + 2 + machines[i].t),
	machines[i].cost2.innerHTML = format(machines[i].c2),
	machines[i].rate.innerHTML = format(persec(i)),
	machines[i].persec.innerHTML = format(persec(i) * machines[i].n)
);

reset = () =>
(
	machines =
		Array(10).fill(0).map((x, i) =>
			({n: 0, t: 0, c: 10 ** (i + 1), c2: 10 ** (i + 2)})),
	buys.innerHTML =
		Array(10).fill(0).map((x, i) =>
		(
			`<div id="machine${i}" class="inner aside`
			+ `${i <= 1 ? `` : ` hidden`}">`
			+ `<button id="buy" onclick="buy(${i})" disabled>`
			+ `${2 ** i} bit program`
			+ `<br><span class="small"><span id="cost">`
			+ `${format(machines[i].c)}</span>B, <span id="amount">0</span>`
			+ ` × <span id="rate">${format(persec(i))}</span>/s`
			+ ` = <span id="persec">0</span>/s</span></button>`
			+ `<button id="tech" class="column-2" onclick="tech(this, ${i})" `
			+ `disabled>Uprate<br><span class="small"><span id="cost2">`
			+ `${format(machines[i].c2)}</span>B</span></button></div>`
		)
		).join(""),
	machines =
		machines.map((x, i) =>
			({...x, div: document.querySelector(`#machine${i}`)}))
		.map((x, i) =>
		({
			...x,
			amount: x.div.querySelector(`#amount`),
			persec: x.div.querySelector(`#persec`),
			buy: x.div.querySelector(`#buy`),
			tech: x.div.querySelector(`#tech`),
			cost: x.div.querySelector(`#cost`),
			cost2: x.div.querySelector(`#cost2`),
			rate: x.div.querySelector(`#rate`),
			rate2: x.div.querySelector(`#rate2`)
		}))
);

reset();
