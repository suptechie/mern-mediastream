import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {withStyles} from 'material-ui/styles'
import Grid from 'material-ui/Grid'
import {read, listRelated} from './api-media.js'
import Media from './Media'
import RelatedMedia from './RelatedMedia'
import { FormControlLabel } from 'material-ui/Form'
import Switch from 'material-ui/Switch'

const styles = theme => ({
  root: {
    flexGrow: 1,
    margin: 30,
  },
  toggle: {
    float: 'right',
    marginRight: '30px',
    marginTop:' 10px'
  }
})

class PlayMedia extends Component {
  constructor({match}) {
    super()
    this.state = {
      media: {postedBy: {}},
      relatedMedia: [],
      autoPlay: false
    }
    this.match = match
  }
  loadMedia = (mediaId, autoplay) => {
    read({mediaId: mediaId}).then((data) => {
      if (data.error) {
        this.setState({error: data.error})
      } else {
        this.setState({media: data})
        if(!autoplay){
          listRelated({
            mediaId: data._id}).then((data) => {
            if (data.error) {
              console.log(data.error)
            } else {
              this.setState({relatedMedia: data})
            }
          })
        }
      }
    })
  }
  componentDidMount = () => {
    this.loadMedia(this.match.params.mediaId, false)
  }
  componentWillReceiveProps = (props) => {
    this.loadMedia(props.match.params.mediaId, false)
  }
  handleChange = (event) => {
   this.setState({ autoPlay: event.target.checked })
  }
  handleAutoplay = (updateMediaControls) => {
    let playList = this.state.relatedMedia
    if(this.state.autoPlay && playList.length > 0 ){
        let playMedia = playList[0]._id
        if(playList.length > 1){
          this.loadMedia(playMedia, true)
          playList.shift()
          this.setState({relatedMedia:playList})
       }else{
          this.loadMedia(playMedia, false)
       }
    }else{
       updateMediaControls()
    }
  }
  render() {
    const nextUrl = this.state.relatedMedia.length > 0
          ? `/media/${this.state.relatedMedia[0]._id}` : ''
    const {classes} = this.props
    return (
      <div className={classes.root}>
        <Grid container spacing={24}>
          <Grid item xs={8} sm={8}>
            <Media media={this.state.media} nextUrl={nextUrl} handleAutoplay={this.handleAutoplay}/>
          </Grid>
          {this.state.relatedMedia.length > 0
            && (<Grid item xs={4} sm={4}>
                    <FormControlLabel className = {classes.toggle}
                        control={
                          <Switch
                            checked={this.state.autoPlay}
                            onChange={this.handleChange}
                            color="primary"
                          />
                        }
                        label={this.state.autoPlay ? 'Autoplay ON':'Autoplay OFF'}
                    />
                  <RelatedMedia media={this.state.relatedMedia}/>
                </Grid>)
           }
        </Grid>
      </div>)
  }
}

PlayMedia.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(PlayMedia)
