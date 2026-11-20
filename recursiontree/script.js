dict = ["Ki", "Mi", "Gi", "Ti", "Pi", "Ei", "Zi", "Yi", "Ri", "Qi"];
names =
[
	"×", "××", "×××", "××××", "↑↑", "↑↑↑", "↑↑↑↑", "ω", "ωω", "ωωω"
];
base = 0;
machines = null;
base2 = Array(names.length + 1).fill(0);
nodes = [];
unlocked = 4;
progress = Array(names.length + 1).fill(0);
completed = 0;
mode = 0;
b = 10;
last = 0;
left = 0;
right = 0;
lsave = 0;
lgoogol = 0;

persec = i =>
	5 ** i / 10 * 2 ** machines[i].t * (unlocked - 3);

format = x =>
(
	x < 1024 ? x % 1 == 0 ? "" + x : x >= 100 ? "" + Math.floor(x)
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
		base > last &&
		(
			right = Math.max(right, Math.min(((o, n) =>
			(
				o.reduce((x, y, i) =>
					y == n[i] || n[i] == null ? x : x + 1, 0)
			)
			)(number.innerHTML.split(""), x.split("")), 1.5))
		),
		number.innerHTML = x,
		chipdiv.setAttribute("style", `--l:${left};--r:${right}`),
		left = left * 0.5 ** (d * 2),
		right = right * 0.5 ** (d * 2),
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
		(saved =>
			!machines && saved ? JSON.parse(saved)
				: Array(10).fill(0).map(() => ({n: 0, t: 0}))
		)(localStorage.getItem("machines")),
	machines =
		machines.map((x, i) =>
		({
			n: x.n, c: Math.floor(10 ** (i + 1 + x.n / 10)),
			t: x.t, c2: 10 ** (i + 2 + x.t)
		})),
	buys.innerHTML =
		machines.map((x, i) =>
		(
			`<div id="machine${i}" class="inner aside`
			+ `${i <= 1 || machines[i - 1].n ? `` : ` hidden`}">`
			+ `<button id="buy" onclick="buy(${i})" disabled>`
			+ `${2 ** i} bit program`
			+ `<br><span class="small"><span id="cost">${format(x.c)}</span>B`
			+ `, <span id="amount">${format(x.n)}</span>`
			+ ` × <span id="rate">${format(persec(i))}</span>/s`
			+ ` = <span id="persec">${format(persec(i) * x.n)}</span>/s`
			+ `</span></button>`
			+ `<button id="tech" class="column-2" onclick="tech(this, ${i})" `
			+ `disabled>Update<br><span class="small"><span id="cost2">`
			+ `${format(x.c2)}</span>B</span></button></div>`
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

base = (saved =>
	saved ? JSON.parse(saved) : base)(localStorage.getItem("base"));

unlocked = (saved =>
	saved ? JSON.parse(saved) : unlocked)(localStorage.getItem("unlocked"));

make.innerHTML = unlocked == 4 ? `Compute a byte of data`
	: `Compute ${unlocked - 3} bytes of data`;

b = Math.max(14 - unlocked, 4);

base2 = (saved =>
	saved ? JSON.parse(saved) : base2)(localStorage.getItem("base2"));

save = d =>
(
	(d == null || (lsave += d, lsave >= 30))
	&& (
		lsave = 0,
		localStorage.setItem("machines", JSON.stringify(machines.map(x =>
			({n: x.n, t: x.t})))),
		localStorage.setItem("base", JSON.stringify(base)),
		localStorage.setItem("nodes", JSON.stringify(nodes.map(x =>
			({n: x.n, locked: x.button.classList.contains("locked")})))),
		localStorage.setItem("base2", JSON.stringify(base2)),
		localStorage.setItem("unlocked", JSON.stringify(unlocked)),
		localStorage.setItem("time", JSON.stringify(new Date().getTime())),
		scrubbutton.innerHTML = "Delete data"
	),
	savebutton.innerHTML = `Save data (${format(Math.floor(30 - lsave))}s)`
);

scrub = () =>
(
	localStorage.removeItem("machines"),
	localStorage.removeItem("base"),
	localStorage.removeItem("nodes"),
	localStorage.removeItem("base2"),
	localStorage.removeItem("unlocked"),
	localStorage.removeItem("time"),
	lsave = 0,
	savebutton.innerHTML = `Save data (${format(Math.floor(30 - lsave))}s)`,
	scrubbutton.innerHTML = "(Auto)save to undo"
);

reset();

(l => l && (gain((new Date().getTime() - JSON.parse(l)) / 1000)))(
	localStorage.getItem("time"));

(f => f(f)(0)(0)(0))(f => b => l => t =>
	(gain(b / 1000), display(b / 1000), enable(), save(b / 1000),
		requestAnimationFrame(f(f)(t - l)(t))));
