/*
var Selectivity = require('selectivity');
require('selectivity/dropdown');
require('selectivity/inputs/single');
require('selectivity/templates');
*/

var tippy = require('tippy.js');

var Choices = require('choices.js');

// import Selectivity from 'selectivity';

class BraxEditable {

	constructor( element ){

		this.element = element;


		this._text = this.element.innerHTML;

		this._value = this.element.getAttribute('data-value') ? this.element.getAttribute('data-value') : this._text;


		this.type = this.element.getAttribute('data-type') ? this.element.getAttribute('data-type') : 'text';

		this.key = this.element.getAttribute('data-key');

		this.name = this.element.getAttribute('data-name');

		this.url = this.element.getAttribute('data-url');

		this.method = this.element.getAttribute('data-get') ? 'GET' : 'POST';

		this.source = this.element.getAttribute('data-source');

		this.template = this.element.getAttribute('data-template');		

		this.hook();

		this._isEditing = false;

		this.hasInputs = false;

		this._inputsEnabled = true;

		this.options = [];

		// this.tooltip = null;

		// this.templates = {};

		// this.templates['default'] = `${data.text}`;

	}

	hook(){

		this.element.classList.add('brax-editable');

		/*
		// text
		this.textContainer = document.createElement('span');
		this.textContainer.setAttribute('data-text', 1);
		this.textContainer.innerHTML = this.element.innerHTML;

		this.element.innerHTML = '';



		this.element.appendChild( this.textContainer );
		*/

		// input
		this.inputContainer = document.createElement('div');
		this.inputContainer.setAttribute('data-input', 1);
		this.inputContainer.className = 'brax-editable-input';
		// this.inputContainer.style.display = 'none';
		
		// this.element.appendChild( this.inputContainer );

		// start editing
		/*
		this.element.addEventListener( 'click', (evt) => {

			if( this.isEditing ) return;

			this.isEditing = true;
			
			evt.preventDefault();

			evt.stopPropagation();
			
			return false;

		});

		this.element.title = this.value;
		*/


		var tippyConfig = {
			trigger: 'click',
			interactive: true,
			html: this.inputContainer,

			// animation: 'perspective',

			arrow: true
			
			// updateDuration: 0,

			/*
			popperOptions: {
				modifiers: {
					preventOverflow: {
						boundariesElement: 'viewport'
						// enabled: false
					}
				}
			}
			*/
			

		};

		tippyConfig.onShow = () => {

			this.isEditing = true;

		};

		tippyConfig.onHide = () => {

			this.isEditing = false;

		};		

		this.tooltip = tippy( this.element, tippyConfig );

		// console.log( 'created tooltip', this.tooltip );

		this.element.setAttribute('data-editing', 0);

		this.element.setAttribute('data-hooked', 1);

	}

	fetchList(){

		if( !this.source ){
			console.error('No source for list provided');
			return false;
		}

		fetch( this.source )
		.then( (response) => {

			if( response.status === 200 ){

				return response.json();

			}else{

				console.error( 'list response error', response );

				return response;

			}

		})
		.then( (response) => {

			// console.log( 'list response', response );

			if( response.items ){

				// console.log('items', response.items);

				if( !this.isEditing ) return;

				this.options = [];

				for( var item of response.items ){

					var option = {};

					// default
					option.value 	= item.value;
					option.text 	= item.text;

					// some systems do this
					if( item.pk ) option.value = item.pk;
					if( item.id ) option.value = item.id;

					// metadata
					if( item.extra ){
						option.extra = item.extra;
						option.customProperties = option.extra // choices
					}

					// option.id 		= option.value; // selectivity
					
					option.label 	= option.text; // choices

					this.options.push( option );

				}

				console.log('got options', this.options);

				// this.options = response.items;

				if( this.inputField ){

					for( var option of this.options ){

						var el 			= document.createElement('option');
						el.value 		= option.value;
						el.innerHTML 	= option.text;

						if( this.value == el.value ) el.setAttribute('selected', 'selected');

						this.inputField.appendChild( el );

					}

					// this.inputField.focus();

				}else if( this.choices ){

					console.log('choices', this.choices);

					this.choices.setChoices( this.options, 'value', 'label', false );

					if( this.value ) this.choices.setValueByChoice( this.value );

					/*
					for( var option of this.options ){

						this.choices.setChoices( option, 'value', 'label', false );

						// if( option.value == this.value ){
						// 	this.choices.setValue( option.value );
						// }

					}
					*/

				}

			}else{

				console.log( 'list response error', response );

				alert( 'Error: ' + response.statusText );

			}

		})
		.catch( (error) => {

			console.log('list error', error);

		});

	}

	addInputs(){

		// console.log('add inputs');

		if( this.type == 'select'){

			this.inputField 		= document.createElement('select');
			
			this.inputContainer.appendChild( this.inputField );

			this.fetchList();

		}else if( this.type == 'choices' ){

			if( !Choices ){
				console.error('Choices not found');
				return false;
			}

			this.inputChoices = document.createElement('select');

			this.inputContainer.appendChild( this.inputChoices );

			this.choices = new Choices( this.inputChoices );

			this.fetchList();

			this.buttonClear = document.createElement('button');
			this.buttonClear.innerHTML = '🗑';
			this.buttonClear.type = 'button';
			this.buttonClear.className = 'brax-editable-button brax-editable-clear';
			this.buttonClear.title = 'Clear';
			this.buttonClear.addEventListener('click', (evt) => {
				this.selectivity.setValue(null);
				evt.preventDefault();
				evt.stopPropagation();
				return false;
			});

			this.inputContainer.appendChild( this.buttonClear );

		}else if( this.type == 'datetime' ){

			var value_date = this.value.split(' ')[0];
			var value_time = this.value.split(' ')[1];

			this.inputDate 			= document.createElement('input');
			this.inputDate.value 	= value_date;
			this.inputDate.type 	= 'date';

			this.inputContainer.appendChild( this.inputDate );

			this.inputTime 			= document.createElement('input');
			this.inputTime.value 	= value_time;
			this.inputTime.type 	= 'time';

			this.inputContainer.appendChild( this.inputTime );

		}else{

			this.inputField 		= document.createElement('input');
			this.inputField.value 	= this.value;
			this.inputField.type 	= this.type;

			this.enterSave( this.inputField );

			this.inputContainer.appendChild( this.inputField );

		}

		this.buttonCancel = document.createElement('button');
		this.buttonCancel.innerHTML = '❌';
		this.buttonCancel.type = 'button';
		this.buttonCancel.className = 'brax-editable-button brax-editable-cancel';
		this.buttonCancel.title = 'Cancel';
		this.buttonCancel.addEventListener('click', (evt) => {
			this.cancel();
			evt.preventDefault();
			evt.stopPropagation();
			return false;
		});

		this.inputContainer.appendChild( this.buttonCancel );

		this.buttonSave = document.createElement('button');
		this.buttonSave.innerHTML = '💾';
		this.buttonSave.type = 'button';
		this.buttonSave.className = 'brax-editable-button brax-editable-save';
		this.buttonSave.title = 'Save';
		this.buttonSave.addEventListener('click', (evt) => {
			this.save();
			evt.preventDefault();
			evt.stopPropagation();
			return false;
		});

		this.inputContainer.appendChild( this.buttonSave );

		this.hasInputs = true;

	}

	enterSave( element ){

		element.addEventListener('keydown', (evt) => {

			if( evt.keyCode == 13 ){
				this.save();
				evt.preventDefault();
				evt.stopPropagation();
				return false;
			}

		});

	}

	focus(){

		if( this.inputField ) this.inputField.focus();

		if( this.selectivity ) this.selectivity.focus();

	}

	cancel(){

		// this.isEditing = false;

		// console.log( 'cancel', this );

		this.element._tippy.hide();

	}

	save(){

		this.inputsEnabled = false;

		// console.log( 'save', this.url, this.key );

		// var req = new Request( this.url );
		// req.method = this.method;

		// console.log('request', req);

		// var headers = new Headers();
		// headers.append('Content-Type', 'application/json');

		var data = new FormData();
		data.append( 'key', this.key );
		data.append( 'name', this.name );
		data.append( 'value', this.currentValue );

		console.log( 'save', this.url, this.key, this.name, this.currentValue );

		var config = {
			method: this.method,
			// headers: headers,
			body: data
		};

		fetch( this.url, config )
		.then( (response) => {

			if( response.status === 200 ){

				return response.json();

			}else{

				console.error( 'response error', response );

				return response;

			}

		})
		.then( (response) => {

			console.log( 'response', response );

			this.inputsEnabled = true;

			if( response.status == 'ok' ){

				if( response.newValue ) this.value = response.newValue;

				if( response.newText ) this.text = response.newText;

				if( response.message ) alert( response.message );

				if( response.reload || response.refresh ) location.reload();

				if( response.redirect ) location.href = response.redirect;

				this.element._tippy.hide();

				this.isEditing = false;

			}else{

				console.log( 'response error', response );

				alert( 'Error: ' + response.statusText );

			}

		})
		.catch( (error) => {

			console.log('error', error);

			this.inputsEnabled = true;

		});

	}

	renderTemplate( item ){

	
		if( this.template == 'test' ){
			return `<div class="selectivity-result-item" data-item-id="${item.id}">
				<em>${escape(item.text)}</em>
				(${item.extra})
			</div>`;
		}
		

		// default
		return `<div class="selectivity-result-item" data-item-id="${item.id}">
			${escape(item.text)}
		</div>`;

	}

	get isEditing(){
		return this._isEditing;
	}

	set isEditing( val ){

		
		if( !this._isEditing && val != false ){


			if(!this.hasInputs){
				this.addInputs();
			}

			// this.textContainer.style.display = 'none';
			// this.inputContainer.style.display = 'flex';

			this.focus();

		}else if( this._isEditing && val != true ){

			// this.element._tippy.hide();

			// this.textContainer.style.display = 'inline';
			// this.inputContainer.style.display = 'none';

		}
		

		// console.log('set edit', val);

		this._isEditing = val;

		this.element.setAttribute('data-editing', this._isEditing ? 1 : 0);	

	}

	get inputsEnabled(){
		return this._inputsEnabled;
	}

	set inputsEnabled( val ){
		
		if( this.inputField ) this.inputField.disabled = !val;

		if( this.inputDate ) this.inputDate.disabled = !val;
		if( this.inputTime ) this.inputTime.disabled = !val;

		if( this.selectivity ) this.selectivity.enabled = val;

		this.buttonCancel.disabled 	= !val;
		this.buttonSave.disabled 	= !val;

		this._inputsEnabled = val;

	}

	get currentValue(){

		if( this.inputDate && this.inputTime ){
			return this.inputDate.value + ' ' + this.inputTime.value;
		}

		if( this.selectivity ){
			return this.selectivity.getValue();
		}

		if( this.choices ){
			return this.choices.getValue( true );
		}

		if( this.inputField ){
			return this.inputField.value;
		}

		console.error('Nothing to get value from');

		return false;

	}

	get text(){
		return this._text;
	}

	set text( val ){
		this._text = val;
		// this.textContainer.innerHTML = val;
		this.element.innerHTML = val;
	}

	get value(){
		return this._value;
	}

	set value( val ){
		
		this._value = val;
		
		this.element.setAttribute('data-value', this._value);

		if( this.inputField ){
			this.inputField.value = this._value;
		}

	}

}

export { BraxEditable }