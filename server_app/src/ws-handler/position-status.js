const PositionStatus = require('../entity/position-status.js');

module.exports = class {
  constructor() {
    this.pStatuses = []
  }
  
  positionStatusUpdate(message, socketConnection) {
    const emitterPs = new PositionStatus(message, socketConnection)
    
    const alreadyExist = this.pStatuses.filter(ps => ps.userId === emitterPs.userId).length > 0
    if (!alreadyExist) {
      this.pStatuses.push(emitterPs)
      this.createSharerPearIfEnable()
    } else {
      this.updateStatus(emitterPs)
    }
    
    // console.log('message', message)
    // console.log('current pStatuses', this.pStatuses.map(p => p.toJson))
    
    this.pStatuses.forEach((p, index) => {
      this.sendForUserByIndex(index)
    })
  }
  
  close(connectionId) {
    const sharedIndex = this.psIndexBySharedUserId(connectionId)
    if (sharedIndex >= 0) {
      this.pStatuses[sharedIndex].shareUserId = ''
    }
    
    const closedIndex = this.psIndexByUserId(connectionId)
    if (closedIndex) {
      this.pStatuses.splice(closedIndex, 1)
    }
  }
  
  createSharerPearIfEnable() {
    const pearCandidatePs = this.pStatuses
      .filter(ps => !ps.haveSharer)
      .map(ps => ps.userId)
    
    if (pearCandidatePs.length < 2) return
    const pearPs = pearCandidatePs.slice(0, 2);
    
    const firstIndex = this.psIndexByUserId(pearPs[0])
    const secondIndex = this.psIndexByUserId(pearPs[1])
    
    this.pStatuses[firstIndex].setSharer(this.pStatuses[secondIndex])
    this.pStatuses[secondIndex].setSharer(this.pStatuses[firstIndex])
  }
  
  updateStatus(newPs) {
    console.log("new one ", newPs)
    const index = this.psIndexByUserId(newPs.userId)
    if (!index) return
    this.pStatuses[index].updateStatus(newPs)
    console.log("updated one ", this.pStatuses[index])
  }
  
  psIndexByUserId(id) {
    return this.pStatuses.findIndex(ps => ps.userId === id)
  }
    
  psIndexBySharedUserId(id) {
    return this.pStatuses.findIndex(ps => ps.shareUserId === id)
  }
  
  sendForUserByIndex(index) {
    const me = this.pStatuses[index]
    
    const sharer = this.pStatuses[this.psIndexByUserId(me.shareUserId)]
    const resBody = {
      me: me.toJson
    }
    if (sharer) resBody.sharer = sharer.toJson
    
    me.connection.send(JSON.stringify(resBody))
  }
}