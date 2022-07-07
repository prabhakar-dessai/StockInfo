chrome.runtime.sendMessage("get-selection-data", (response) => {
	let stockName = response;
	fetch(`http://localhost:5000/find/${stockName}`)
		.then((res) => res.json())
		.then((data) => {
			let result = data;
			console.log(result);
		})
		.catch((err) => console.log(err));
});
