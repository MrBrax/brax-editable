class BraxEditable {

	constructor( element ){

		this.element = element;


		this._text = this.element.innerHTML;

		this._value = this.element.getAttribute('data-value') ? this.element.getAttribute('data-value') : this._text;


		this.type = this.element.getAttribute('data-type') ? this.element.getAttribute('data-type') : 'text';

		this.key = this.element.getAttribute('data-key');

		this.url = this.element.getAttribute('data-url');

		this.method = this.element.getAttribute('data-get') ? 'GET' : 'POST';

		this.source = this.element.getAttribute('data-source');

		this.template = this.element.getAttribute('data-template');		

		this.hook();

		this._isEditing = false;

		this.hasInputs = false;

		this._inputsEnabled = true;

		this.options = [];

		// this.templates = {};

		// this.templates['default'] = `${data.text}`;

	}

	hook(){

		this.element.classList.add('brax-editable');

		// text
		this.textContainer = document.createElement('span');
		this.textContainer.setAttribute('data-text', 1);
		this.textContainer.innerHTML = this.element.innerHTML;

		this.element.innerHTML = '';

		/*
		// icon
		this.iconContainer = document.createElement('span');
		this.iconContainer.setAttribute('data-icon', 1);
		this.iconContainer.innerHTML = '✏';
		this.element.appendChild( this.iconContainer );
		*/

		this.element.appendChild( this.textContainer );

		// input
		this.inputContainer = document.createElement('span');
		this.inputContainer.setAttribute('data-input', 1);
		this.inputContainer.style.display = 'none';
		this.element.appendChild( this.inputContainer );

		// start editing
		this.element.addEventListener( 'click', (evt) => {

			if( this.isEditing ) return;

			this.isEditing = true;
			
			evt.preventDefault();

			evt.stopPropagation();
			
			return false;

		});

		this.element.setAttribute('data-editing', 0);	

	}

	fetchList(){

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

				this.options = response.items;

				if( this.inputField ){

					for( var option of this.options ){

						var el 			= document.createElement('option');
						el.value 		= option.v ? option.v : option.value;
						el.innerHTML 	= option.t ? option.t : option.text;

						if( this.value == el.value ) el.setAttribute('selected', 'selected');

						this.inputField.appendChild( el );

					}

					// this.inputField.focus();

				}else if( this.selectivity ){

					for( var option of this.options ){

						this.selectivity.items.push( option );

						if( option.id == this.value ){
							this.selectivity.setValue( option.id );
							// console.log('found value', option.id);
						}

					}

					// this.selectivity.focus();

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

		if( this.type == 'select'){

			this.inputField 		= document.createElement('select');
			
			this.inputContainer.appendChild( this.inputField );

			this.fetchList();

		}else if( this.type == 'selectivity' ){

			this.inputBox 		= document.createElement('div');
			
			this.inputContainer.appendChild( this.inputBox );

			this.selectivity = new Selectivity.Inputs.Single({
				element: this.inputBox,
				items: [],
				templates: {
					resultItem: this.renderTemplate.bind(this)
				},
				// showSearchInputInDropdown: false,
				showSearchInput: true,
				allowClear: true,
				placeholder: this.text
			});

			// console.log( this.selectivity );

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

		this.isEditing = false;

	}

	save(){

		this.inputsEnabled = false;

		console.log( 'save', this.url, this.key );

		// var req = new Request( this.url );
		// req.method = this.method;

		// console.log('request', req);

		// var headers = new Headers();
		// headers.append('Content-Type', 'application/json');

		var data = new FormData();
		data.append( 'key', this.key );
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

			// console.log('edit');

			if(!this.hasInputs){
				this.addInputs();
			}

			this.textContainer.style.display = 'none';
			this.inputContainer.style.display = 'flex';

			this.focus();

		}else{

			this.textContainer.style.display = 'inline';
			this.inputContainer.style.display = 'none';

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

		return this.inputField.value;

	}

	get text(){
		return this._text;
	}

	set text( val ){
		this._text = val;
		this.textContainer.innerHTML = val;
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



// export default BraxEditable;