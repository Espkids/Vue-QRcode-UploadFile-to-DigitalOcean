const aws = require('aws-sdk')
const multer = require('multer')
const multerS3 = require('multer-s3')

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const app = express()
const PORT = 5000

app.use(bodyParser.json())
app.use(cors())

const spacesEndpoint = new aws.Endpoint('sgp1.digitaloceanspaces.com') //Endpoint ดูจาก spaces -> setting
const spaces = new aws.S3({
    endpoint: spacesEndpoint,
    accessKeyId: '2S4WCDEYR2MBFU5VTI2R',
    secretAccessKey: '+Z5G/LgaGaMM/L6/lNWMWxdVvBbtwsAV1+3n4rx+E2Q'
    // access และ secret key ได้จากการสร้างโดยกด manage keys เมื่อสร้างแล้ว
    // ซักพัก secret จะไม่แสดงถ้าลืมต้องกด regenarate key หรือสร้างใหม่
})

var fileName = null
const upload = multer({
    storage: multerS3({
        s3: spaces,
        bucket: 'photoims/photoims', //ถ้าเซฟลง space ใช้แค่ photoims แต่เซฟลงโฟลเดอร์อีกทีเลย / ตามด้วยชื่อโฟลเดอร์
        acl: 'public-read',
        key: function (request, file, cb) {
            console.log(file)
            fileName = file.originalname
            cb(null, file.originalname)
        }
    })
}).array('file', 1)

app.post('/upload', async function (request, response, next) {
    fileName = null
    const uploadFile = await upload(request, response, function (error) {
        if (error) {
            console.log(error)
            response.send(error)
        } else {
            console.log('File has uploaded')
            const fileURL = spacesEndpoint.protocol+'//'+'photoims.'+spacesEndpoint.host+'/photoims/'+fileName
            response.send(fileURL)
        }
    })
})

app.get('/', (req, res) => {
    res.send('Hello')
})

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))