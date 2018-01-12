// const tippy = require('tippy.js');
// const tippy = require('tippy.js/tippy.standalone.js');

// import Popper from 'popper.js';

// import { tippy } from 'tippy.js/src/js/tippy.js';

import tippy from 'tippy.js/dist/tippy.standalone.js';

// import tippy from 'tippy.js';

// const Choices = require('choices.js');

// import Choices from 'choices.js/assets/scripts/src/choices.js';

import Choices from 'choices.js';

const BraxEditableTemplates = {}
BraxEditableTemplates['test'] = function( choices, template ){

	var config = choices.config;

	var classNames = config.classNames;

	return {

		item: (data) => {
			return template(`
				<div class="${classNames.item} ${data.highlighted ? classNames.highlightedState : classNames.itemSelectable}" data-item data-id="${data.id}" data-value="${data.value}" ${data.active ? 'aria-selected="true"' : ''} ${data.disabled ? 'aria-disabled="true"' : ''}>
					<span>&bigstar;</span> ${data.label}
				</div>
			`);
		},

		choice: (data) => {
			return template(`
				<div class="${classNames.item} ${classNames.itemChoice} ${data.disabled ? classNames.itemDisabled : classNames.itemSelectable}" data-select-text="${config.itemSelectText}" data-choice ${data.disabled ? 'data-choice-disabled aria-disabled="true"' : 'data-choice-selectable'} data-id="${data.id}" data-value="${data.value}" ${data.groupId > 0 ? 'role="treeitem"' : 'role="option"'}>
					<span>&bigstar;</span> ${data.label}
				</div>
			`);
		}

	};

}

class BraxEditable {

	constructor( element ){

		if(!element){
			console.error('No element provided');
			return false;
		}

		this.element = element;

		// the only thing displayed to the user
		this._text = this.element.innerHTML;

		// main value
		this._value = this.element.getAttribute('data-value') ? this.element.getAttribute('data-value') : this._text;

		// input type
		this.type = this.element.getAttribute('data-type') ? this.element.getAttribute('data-type') : 'text';

		// primary key, or id
		this.key = this.element.getAttribute('data-key');

		// field name
		this.name = this.element.getAttribute('data-name');

		// request url
		this.url = this.element.getAttribute('data-url');

		// request method
		this.method = this.element.getAttribute('data-get') ? 'GET' : 'POST';

		// list source for choices
		this.source = this.element.getAttribute('data-source');

		// template for choices
		this.template = this.element.getAttribute('data-template');		


		this.hook();


		this._isEditing = false;

		this.hasInputs = false;

		this._inputsEnabled = true;

		this.options = [];

	};

	hook(){

		this.element.classList.add('brax-editable');


		// input
		this.inputContainer = document.createElement('div');
		this.inputContainer.setAttribute('data-input', 1);
		this.inputContainer.className = 'brax-editable-input';


		// Tooltip
		var tippyConfig = {
			trigger: 'click',
			interactive: true,
			html: this.inputContainer,
			arrow: true			

		};

		tippyConfig.onShow = () => {

			this.isEditing = true;

		};

		tippyConfig.onShown = () => {

			this.focus();

		};

		tippyConfig.onHide = () => {

			this.isEditing = false;

		};		

		this.tooltip = tippy( this.element, tippyConfig );



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

			if( response.items ){

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

				// console.log('got options', this.options);

				if( this.inputField ){

					for( var option of this.options ){

						var el 			= document.createElement('option');
						el.value 		= option.value;
						el.innerHTML 	= option.text;

						if( this.value == el.value ) el.setAttribute('selected', 'selected');

						this.inputField.appendChild( el );

					}

				}else if( this.choices ){

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

			var t = this; // i hate doing this

			this.choices = new Choices( this.inputChoices, {

				callbackOnCreateTemplates: function( template ){
					// return t.getTemplates( this, template );
				
					if( t.template ){
						if( BraxEditableTemplates[ t.template ] ){
							return BraxEditableTemplates[ t.template ]( this, template );
						}else{
							console.error( 'Invalid template', t.template, BraxEditableTemplates );
						}
					}

				}

			} );

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

			// scroll to change
			var timeStep = 60000 * 10;
			this.inputTime.addEventListener('wheel', (evt) => {
				this.inputTime.valueAsNumber += evt.deltaY < 0 ? timeStep : -timeStep;
				evt.preventDefault();
				return false;
			});

			var dateStep = 1000 * 60 * 60 * 24;
			this.inputDate.addEventListener('wheel', (evt) => {
				this.inputDate.valueAsNumber += evt.deltaY < 0 ? dateStep : -dateStep;
				evt.preventDefault();
				return false;
			});


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

		if( this.inputChoices ){
			
			this.choices.showDropdown();
			
			this.choices.input.focus();

		}

	}

	cancel(){

		this.element._tippy.hide();

	}

	save(){

		this.inputsEnabled = false;

		// console.log( 'save', this.url, this.key, this.name, this.currentValue );

		// var req = new Request( this.url );
		// req.method = this.method;

		// console.log('request', req);

		// var headers = new Headers();
		// headers.append('Content-Type', 'application/json');

		var data = new FormData();
		data.append( 'key', this.key );
		data.append( 'name', this.name );
		data.append( 'value', this.currentValue );		

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

			// this.focus();

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

export {
	BraxEditable,
	BraxEditableTemplates
}