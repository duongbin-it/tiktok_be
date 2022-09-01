const BODY_USER = (req) => {
    return {
        live: req.body.live,
        blue_check: req.body.blue_check,
        name: req.body.name,
        username: req.body.username,
        count_followers: req.body.count_followers,
        count_likes: req.body.count_likes,
        bio: req.body.bio,
        following: req.body.following,
        avatar: req.body.avatar
    }
}

const BODY_VIDEO = (req) => {
    return {
        title: req.body.title,
        heart: req.body.heart,
        share: req.body.share,
        image: req.body.image,
        comment: req.body.comment,
        username: req.body.username,
        name_tag: req.body.name_tag,
        link_music: req.body.link_music,
        link_video: req.body.link_video,
        name_music: req.body.name_music,
        heart_check: req.body.heart_check,
    }
}

const SUCCESS_NOTI = (uuid) => {
    return {
        type: "user",
        status: "200 OK",
        messenger: "Successful video upload!",
        uid_code_json: uuid()
    }
}

module.exports = { BODY_USER, BODY_VIDEO, SUCCESS_NOTI }