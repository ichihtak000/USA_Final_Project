module.exports = class {
  constructor(rowData, connection) {
    const json = JSON.parse(rowData)
    
    this.userId = connection.id
    this.longitude = json.longitude
    this.latitude = json.latitude
    this.activityStatus = json.activity_status
    this.shareUserId = ''
    this.connection = connection
  }
  
  setSharer(ps) {
    this.shareUserId = ps.userId
  }
  
  updateStatus(ps) {
    this.longitude = ps.longitude
    this.latitude = ps.latitude
    this.activityStatus = ps.activityStatus
  }
  
  get toJson() {
    return {
      userId: this.userId,
      longitude: this.longitude,
      latitude: this.latitude,
      activityStatus: this.activityStatus,
      shareUserId: this.shareUserId
    }
  }
  
  get haveSharer() {
    return this.shareUserId !== ''
  }
}
