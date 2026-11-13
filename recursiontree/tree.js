mode = 0;
names =
[
	"×", "××", "×××", "××××", "↑↑", "↑↑↑", "↑↑↑↑"
];
base2 = Array(names.length + 1).fill(0);
progress = Array(names.length + 1).fill(0);
nodes = [];
completed = 0;
b = 10;

recurse = i =>
(
	i <= 3
	? (
		base2[i] = (i <= 2 && base2[i + 2]) ? 1 : Math.floor(base2[i] / b),
		base2 = base2.map((x, j) => j < i ? 1 : x)
	)
	: i <= 6
	&& (
		base2[0] = i == 4 ? 5 : base2[i] + 1,
		base2 = base2.map((x, j) => j > 0 && j <= i ? 0 : x)
	),
	base2[i + 1]++
);

nodeclick = i =>
(
	nodes[i + 1]
	&& (
		nodes[i + 1].title.innerHTML = names[i + 1],
		nodes[i + 1].button.classList.remove("locked")
	),
	i != unlocked && mode >= 1
	? (
		[base2[i + 2], nodes[i].n] =
		[
			base2[i + 2] - (mode == 1 ? 1
				: Math.min(base2[i + 2], 60 - nodes[i].n)),
			Math.min(nodes[i].n + (mode == 1 ? 1 : base2[i + 2]), 60)
		]
	)
	: (
		i == unlocked
		&& (
			unlocked++, make.innerHTML = `Compute ${unlocked - 3}B of data`,
			b > 3 &&
			(
				b--,
				progress = progress.map(() => 0),
				nodes.forEach(x => x.n = 0),
				completed = 0, base = 0, reset()
			)
		),
		recurse(i)
	)
);

autop = i =>
(
	i <= 2
	? (
		progress[i] += Math.min(base2[i], b),
		progress[i + 1] = Math.max(Math.floor((progress[i] - 1) / (b - 1)), 0),
		base2[i] = Math.floor((progress[i] - 1) % (b - 1)) + 1
	)
	: i == 3
	? (
		progress[i] += Math.min(base2[i], b),
		progress[i + 1] = Math.floor(progress[i] / b),
		base2[i] = progress[i] % b
	)
	: i <= 5 && (
		progress[i] += Math.min(base2[i], b - 1),
		progress[i + 1] = Math.floor(progress[i] / (b = 1)),
		base2[i] = progress[i] % (b - 1)
	)
);

gain2 = d =>
(
	progress[0] += machines.map((x, i) => persec(i) * x.n)
		.reduce((x, y) => x + y, 0) * d,
	nodes.forEach((node, i) => progress[i + 1] += node.n * d),
	progress.forEach((x, i) =>
	(
		i < completed ? autop(i)
		: i == completed ? base2[i] += Math.floor(progress[i])
		: (
			base2[i - 1] >= (i <= 5 ? b : b - 1) && progress[i] >= 1
				&& (recurse(i - 1), progress[i] = 0)
		)
	)),
	progress[0] %= 1
);

display2 = () =>
(
	googol.innerHTML =
	(
		Array(3).fill(0).reduce((x, y, i) =>
		(
			(base2[i + 5] == 0 ? "" : (base2[i + 5] == 1 ? "" : "(")
				+ b + "↑".repeat(i + 2) + (base2[i + 5] == 1 ? ""
					: ")<sup>" + base2[i + 5] + "</sup>")) + x
		),
		base2[0] + Array(4).fill(0).reduceRight((x, y, i) =>
		(
			base2[i + 1] == 0 ? ""
				: (unlocked > 4 || base2[i + 1] >= 30 || i < 3 && base2[i + 2]
				? `×${b}<sup>${base2[i + 1] + x}</sup>`
				: "0".repeat(base2[i + 1]) + x)
		),
		""))
	),
	nodepre.innerHTML = base2[0],
	nodes.forEach((node, i) =>
	(
		node.info.innerHTML =
			i > unlocked || node.title.innerHTML == "" ? ``
			: i == unlocked ? b == 3 ? `` : `prestige`
			: i + 1 <= completed ? mode == 0 ? base2[i + 1] : `instant`
			: `${base2[i + 1]}, ${node.n}/s`
	))
);

enable2 = () =>
(
	nodes.forEach((node, i) =>
	(
		i < completed
			? node.button.classList.add("completed")
			: node.button.classList.remove("completed"),
		i <= unlocked && i + 1 > completed &&
			(i == unlocked || mode == 0 ? base2[i] >= (i <= 4 ? b : b - 1)
				: i + 1 < names.length && base2[i + 2] >= 1)
			? node.button.removeAttribute("disabled")
			: node.button.setAttribute("disabled", true)
	))
);

complete = () =>
	nodes.forEach((node, i) =>
		node.n == 60 && completed == i && completed++);

tree.innerHTML =
	[
		[-1], [0], [1, 4], [2, 5], [3, 6]
	]
	.map(x =>
	(
		`<div class="inner xcenter"><div class="inner horizontal">`
		+ x.map(i =>
		(
			i == null ? `<div></div>`
			: i == -1
			? `<button id="nodepre" class="node empty" disabled></button>`
			: `<button id="node${i}" class="node${i == 0 ? "" : " locked"}"`
			+ `onclick="nodeclick(${i})" disabled>`
			+ `<span id="name">${i >= 0 ? names[i] : ""}</span>`
			+ `<br><span id="info" class="small">0/s</span></button>`
		)
		).join("") + `</div></div>`
	)
	).join("");

(f => f(f)(0)(0)(0))(f => b => l => t =>
	(gain2(b / 1000), complete(), display2(), enable2(),
		requestAnimationFrame(f(f)(t - l)(t))));

(buttons =>
(
	buttons.forEach((button, i) =>
	(
		button.onclick = () =>
		(
			mode = i,
			buttons.forEach(button =>
			(
				button.removeAttribute("disabled"),
				button.setAttribute("class", "unselected")
			)),
			button.setAttribute("disabled", true),
			button.setAttribute("class", "selected")
		)
	))
)
)([manual, auto, mauto]);

nodes =
	names.map((x, i) =>
		({name: names[i], button: document.querySelector(`#node${i}`)}))
	.map((x, i) =>
	({
		...x, n: 0, info: x.button.querySelector(`#info`),
		title: x.button.querySelector(`#name`)
	}));
