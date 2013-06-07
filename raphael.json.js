/*
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/mit-license.php
 *
 */

(function() {

	Raphael.fn.preserveSet = function(set, setName){
		var setObj = {
			name: setName,
			val: set
		};

		this.setsToPreserve ? 
			this.setsToPreserve.push(setObj) : (this.setsToPreserve = [setObj]);
	}

	Raphael.fn.restoreSet = function(setName){
		return this.restoredSets[setName];
	}

	function markSetElements(set, setName, paper){
		set.forEach(function(el){
					if ( el.constructor.prototype == paper.set().constructor.prototype )
						markSetElements(el, setName, paper);
					else
					 	el.sets ? el.sets.push(setName) : (el.sets = [setName]);
				});
	}

	Raphael.fn.toJSON = function(callback) {
		var
			data,
			elements = new Array,
			paper    = this
			;

		//recursively mark the set elements	
		if(paper.setsToPreserve)
			paper.setsToPreserve.forEach(function(pset){
				markSetElements(pset.val, pset.name, paper);				
			});

		for ( var el = paper.bottom; el != null; el = el.next ) {
			data = callback ? callback(el, new Object) : new Object;

			if ( data ) elements.push({
				data:      data,
				type:      el.type,
				attrs:     el.attrs,
				transform: el.matrix.toTransformString(),
				id:        el.id,
				sets:      el.sets
				});
		}

		return JSON.stringify(elements);
	}

	Raphael.fn.fromJSON = function(json, callback) {
		var
			el,
			paper = this
			;

		var restoredSets = this.restoredSets = {};

		if ( typeof json === 'string' ) json = JSON.parse(json);

		for ( var i in json ) {
			if ( json.hasOwnProperty(i) ) {
				el = paper[json[i].type]()
					.attr(json[i].attrs)
					.transform(json[i].transform);

				el.id = json[i].id;

				if ( callback ) el = callback(el, json[i].data);

				if ( el ) paper.set(el);

				//recover the associated sets and push to each of them
				if(json[i].sets)
				{
					
					json[i].sets.forEach(function(restoredSet){

						restoredSets[restoredSet] ? restoredSets[restoredSet].push(el) : (restoredSets[restoredSet] = paper.set(el));
					});
				}

			}
		}
	}
})();
