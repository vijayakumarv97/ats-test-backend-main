 const ISOdateToCustomDate =(value) =>{
	const dateFormat = new Date(value);
	let year = dateFormat.getFullYear();
	let month = dateFormat.getMonth()+1;
	let date = dateFormat.getDate();

	if (date < 10) {
		date = '0' + date;
	}
	if (month < 10) {
		month = '0' + month;
	}
	return date + '/' + month + '/' + year;

}


module.exports.ISOdateToCustomDate = ISOdateToCustomDate