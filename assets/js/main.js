
	(function(){
			var cansData = {
					"expenditure": 0.4, 
					"materials" : {
							"1": 5, 
							"2": 10,
							"67":15,
							"34":40
					},
					"prices": {
						"1": { 
							"3":120, 
							"5":123.45,
							"49":135
						},
						"2":{
							"3": 240,
							"5": 240.80,
							"49": 230
						},
						"67":{
							"3": 340,
							"5": 360,
							"49": 300.05
						},
						"34":{
							"3": 1200,
							"5": 1050.99,
							"49": 1150
						}
					}
				};



			var selfData = {};
			var currentForm = document.querySelector("#area-calculator"), 
				currentSize = document.querySelector("#area-calculator input[type='number']");

			
			var brandNames = ['Street Life', 'Only Yellow', 'Bezdna', 'Tikkyrila'], 
				companyNames = ['My Office', 'Sales Free (no)', 'Red Price'];


			//  begin something that make sense //
			var materials = cansData.materials, 
				prices = cansData.prices;

			var tableData = [];

				selfData.materialsList = {}; 
				selfData.dillersList = {};

			var pricelistToggler = document.querySelector('.collapse-options i');
			pricelistToggler.onclick = function(){
				let table = document.querySelector('.collapse-options table');
				if (table.style.display === 'none') {
					document.querySelector('.collapse-options i').innerHTML = 'hide price list';
					table.style.display = 'block';
				}  else {
					document.querySelector('.collapse-options i').innerHTML = 'show price list';
					table.style.display = 'none';
				}
			}

			currentForm.addEventListener('submit', function(event){
														event.preventDefault();
														let benefits = [], bestBrand = {}, details = [], 
														resultsView = document.querySelector('#response-data'), 
														priceEl = resultsView.querySelector('#best-price'), 
														companyEl = resultsView.querySelector('#best-brand'),
														headings = document.querySelectorAll('.headings'), 
														detailsList = document.querySelector('#offer-details');

														benefits = activate(),
														bestBrand = benefits[0];

														headings.forEach( item => item.style.opacity = 1 );

														companyEl.innerHTML = selfData.dillersList[bestBrand.diller];
														priceEl.innerHTML = Math.ceil(bestBrand.totalPrice);
														priceEl.classList.add("currency-rub");

														detailsList.innerHTML = '';

														bestBrand.materials.forEach( function(item) {
															let brandName = document.createElement("li"),
																brandDetails = document.createElement("li");

															detailsList.appendChild(brandName);
															detailsList.appendChild(brandDetails);


															brandDetails.innerHTML = item.amount + 'шт. по ' + 
																			item.volume + 'л. за ' + item.price + 'р.';
															brandName.innerHTML = selfData.materialsList[item.material];

														} )
														
														console.dir(benefits)
													});

			function activate() {

					
					selfData.size = currentSize.value;
					selfData.totalVolume = selfData.size * cansData.expenditure;

					selfData.dillersPriceList = {};
					
					selfData.currentOffersData = {};
					selfData.currentVolumesData = {};
					selfData.remainOfCalcVolume = {};

					selfData.bestOffers = [];
					selfData.offerDetails = {};


				/* Create main data controller with calculated price per liter for everyone  */
				for (let paintID of Object.keys(materials)) {
					let material = materials[paintID], 
						currentPrices = prices[paintID];

					for (let [dillerID, price] of Object.entries(currentPrices)) {
						let pricePerLiter = price / material;

						if (!selfData.dillersPriceList[dillerID]) 
								selfData.dillersPriceList[dillerID] = [], selfData.remainOfCalcVolume[dillerID] = '';

						selfData.dillersPriceList[dillerID].push({ id: paintID, pricePerLiter : pricePerLiter });
					};

				};

				/*  Get sorted data of full prices, default volumes and correct amounts for every diller */
				for ( let id of Object.keys(selfData.dillersPriceList) ) {

					selfData.dillersPriceList[id].sort( (prev, next) => prev.pricePerLiter - next.pricePerLiter );

				
					selfData.remainOfCalcVolume[id] = selfData.totalVolume; // <- usually I am not explain what I do
					selfData.offerDetails[id] = [];				// -> but I do my best
					selfData.currentOffersData[id] = 0;
					selfData.currentVolumesData[id] = 0;

					/* **********
						------------------
							KEEP CALM
								&
						Have a nice day (:
						------------------
								********** */
					selfData.dillersPriceList[id].forEach( function(value, index) {

						// START Variables list //
						let price = prices[value.id][id], 
							volume = materials[value.id];

						let remain = selfData.remainOfCalcVolume[id],
							amount = Math.trunc( remain / volume ),

							offerOpen = ((amount * price) + selfData.currentOffersData[id]),
							offerClose = ((amount + 1)*price + selfData.currentOffersData[id]),

							volumeForOpen = ((amount * volume) + selfData.currentVolumesData[id]),
							volumeForClose = ((amount + 1) * volume + selfData.currentVolumesData[id]);

						let materialsDataOpen = {
								material: value.id,
								diller: id,
								amount: amount,
								volume: volume,
								price: price,
								totalVolume: volumeForOpen,
								totalPrice: offerOpen
							};
						let	materialsDataClose = {
								material: value.id,
								amount: amount,
								diller: id,
								volume: volume,
								price: price,
								totalVolume: (volumeForOpen + volume),
								totalPrice: (offerOpen + price)
							};
						// END Variables list //

							if ( selfData.remainOfCalcVolume[id] > volume ) {


									/* refresh values for next battles */
									selfData.remainOfCalcVolume[id] = remain - volumeForOpen;
									selfData.currentOffersData[id] = offerOpen;
									selfData.currentVolumesData[id] = volumeForOpen;

								let offerIndex = selfData.bestOffers.push({
										diller: id,
										totalVolume: volumeForClose,
										totalArea : (volumeForClose / cansData.expenditure),
										totalPrice: offerClose,
										materials: []
									});
								selfData.bestOffers[offerIndex - 1].materials.push( ...selfData.offerDetails[id] )
								selfData.bestOffers[offerIndex - 1].materials.push( materialsDataClose );

								selfData.offerDetails[id].push( materialsDataOpen );

							} else {
								let overOffer = selfData.currentOffersData[id] + price,
									overVolume = selfData.currentVolumesData[id] + volume;
								let materialIndex = selfData.offerDetails[id].push( materialsDataClose );

								if ( materialsDataClose.amount == 0 ) 
										materialsDataClose.amount += 1;

								let offerIndex = selfData.bestOffers.push({
										diller: id,
										totalVolume: overVolume,
										totalArea: (overVolume / cansData.expenditure),
										totalPrice: overOffer,
										materials: []
									});
								selfData.bestOffers[offerIndex - 1].materials.push( ...selfData.offerDetails[id] );

								selfData.offerDetails[id].splice(materialIndex - 1, 1);
							};

						  return
						});

					};

					selfData.bestOffers.sort( (prev, next) => prev.totalPrice - next.totalPrice );

					return selfData.bestOffers.splice(0,5);
	
				};

			setNames();
			function setNames() {
				let i = 0;

				function getRandomIdFromArray(array) {
					// return Math.floor(Math.random() * array.length);
					return array.length - 1
				};

				for (let paintID of Object.keys(prices)) {
					var brandID = getRandomIdFromArray(brandNames);

					i++;
					
					selfData.materialsList[paintID] = brandNames[brandID];
					brandNames.splice(brandID, 1);

					if (i === 1) {
						for (let dillerID of Object.keys(prices[paintID])) {
							var companyID = getRandomIdFromArray(companyNames);
							selfData.dillersList[dillerID]   = companyNames[companyID];
							companyNames.splice(companyID, 1);
						}
					}
				}
			};


			fillTable();
			function fillTable(){
				let tableContent = document.querySelector("table tbody")

				for ( let paintID of Object.keys(prices) ) {
					for ( let dillerID of Object.keys(prices[paintID]) ) {
						tableData.push({
							diller : selfData.dillersList[dillerID],
							material: selfData.materialsList[paintID],
							volume: materials[paintID],
							price: prices[paintID][dillerID]
						})
					}
				}

				tableData.forEach(function(data, index){
					let row  = document.createElement("tr");
						tableContent.appendChild(row);

						for ( id of Object.keys(data) ) {
							let td = document.createElement("td");
							td.innerHTML = data[id];
							row.appendChild(td)
						}
				})
			}

		})();