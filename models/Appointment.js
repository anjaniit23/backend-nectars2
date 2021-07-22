const mongoose = require('mongoose');


const AppointmentSchema = new mongoose.Schema({
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    customer:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    meetLink: {
        type: String
    },
    startTime: {
        type: Date,
        default: Date.now()
    },
    endTime: {
        type: Date
    },
    title: String,
    Description: String,
},{timestamps: true});

AppointmentSchema.virtual('getUploadTime').get(function() {
    const date = this.dateUpload
    const Year = date.getFullYear()
    const hh = date.getHours()
    var mm = date.getMinutes()
    const month = new Intl.DateTimeFormat('en-US', {month: "long"}).format(date)
    const day = date.getDate()
    if(mm=="0"){
        mm="00"
    }
    if(hh>="12")
	{
		var a="PM"
	}
	else{
		var a="AM"
	}
    return `${month} ${day}, ${Year}, ${hh}:${mm} ${a}`
})


AppointmentSchema.pre('save', async function (next) {
    try {
      if (this.isNew) {
        this.endTime =new Date(new Date(this.dateUpload).getTime() + 30 * 60 * 1000);
        console.log(this.availTill)
      }
      next();
    } catch (error) {
      next(error);
    }
  });

const Appointment = mongoose.model('Appointment', AppointmentSchema);
module.exports = Appointment;