
class Queue{

	//init
	constructor(){

		this.engin;

		this.List = {};
		this.Endpoint = { head : null, tail : null, };
		this.key = 0;

		//0.0.2或許該新增自訂旗標的功能
		this.Flags =[
			{ flagTime : 500, last : null },
			{ flagTime : 1000, last : null },
			{ flagTime : 1500, last : null },
			{ flagTime : 2000, last : null },
			{ flagTime : 2500, last : null },
			{ flagTime : 3000, last : null }, ];
	}

	add( job ){
		//set id
		let d = new Date();
		let myKey = this.key++;

		//push job to Queue
		this.List[myKey] = {
			timeOut : job.timeOut,
			callback : job.callback,
			next : null,
			previous : null
		};

		//router
		if( this.Endpoint.head === null ){

			//init Endpoint
			this.Endpoint.head = myKey;
			this.Endpoint.tail = myKey;

		}else{

			this.router( myKey );

		}


	}

	findLastKey(index){

		if( this.Flags[index].last !== null)
			return this.Flags[index].last;

		else if ( index > 0 )
			return this.findLastKey( index - 1 );

		else
			return this.Endpoint.head;
	}

	router( key ){

		//現在要插入的key
		let current = this.List[key];

		//有辦法改成func?
		for (var i = this.Flags.length - 1; i >= 0; i--) {

			//這個func需要處理一下

			if( this.Flags[i].flagTime == current.timeOut ){

				let lastKey = this.findLastKey(i);

				let last = this.List[lastKey];

				if( last.timeOut > current.timeOut ){

					this.Endpoint.head = key;
					current.next = lastKey;
					last.previous = key;
					this.Flags[i].last = key;

				}else{

					//link list
					current.next = last.next;
					current.previous = lastKey;

					last.next = key;

					if(current.next !== null)
						this.List[ current.next ].previous = key;
					else
						this.Endpoint.tail = key;


					this.Flags[i].last = key;

				}

				break;

			}else if ( this.Flags[i].flagTime < current.timeOut ){

				let lastKey = this.findLastKey(i);

				let findPosition = ( k ) => {

					if( this.List[k].next === null)
						return this.Endpoint.tail;

					else if( this.List[k].timeOut > current.timeOut )
						return this.List[k].previous

					else if ( this.List[k].timeOut <= current.timeOut)
						return findPosition( this.List[k].next );

				};

				let last = this.List[findPosition(lastKey)];

				//link list
				current.next = last.next;
				current.previous = lastKey;

				last.next = key;

				if(current.next !== null)
					this.List[ current.next ].previous = key;
				else
					this.Endpoint.tail = key;

				break;

			}
		};
	}

	//using in debug
	showAllData(){
		console.log('Queue data', this.List);
		console.log('Endpoint data ', this.Endpoint);
		console.log('Flags data ', this.Flags);
	}

	readAll( sort ){

		if( ! sort){
			return this.List;

		}else{

			let data = [];

			let readList = ( key ) => {

				data.push( this.List[key] );

				if( this.List[key].next !== null )
					readList( this.List[key].next );
				else
					return;
			};

			readList( this.Endpoint.head );
			return data;
		}

	}

	do( current, now ){

		if(current.timeOut <= now){

			current.callback();

			if( current.next !== null){

				current = this.List[ current.next ];
				return this.do( current, now );

			}else{

				clearInterval(this.engin);
				console.log('-----finish-----');
			}
		}else{
			return current;
		}
	}

	start( ctrlTick ){

		let current;
		let time = 0;

		if( time == 0 )
			current = this.List[this.Endpoint.head];

		this.engin = setInterval( () => {

			if( ctrlTick )
				console.log('tick');

			current = this.do( current, time );

			time += 100;

		}, 100);

	}

}

class Job{

	//並沒有相對可用來設定的func
	// constructor(){
	// 	this.timeOut = 0;
	// 	this.callback;
	// 	this.next = '';
	// }

	constructor(time, func){
		this.timeOut = time;
		// this.next = '';
		// this.previous = '';
		this.callback = func;
	}
}

module.exports ={ Queue, Job };