const express = require('express')

const auth = require('../../middleware/auth')
const userService = require('./user.service')
const userExceptionHandler = require('./exception')

const router = express.Router()

/**
 * @api {post} /user Registration
 * @apiVersion 1.0.0
 * @apiName RegisterUser
 * @apiGroup User
 *
 * @apiBody {String} firstname
 * @apiBody {String} lastname
 * @apiBody {String} email
 * @apiBody {String} password
 * @apiBody {String} role Normal OR Admin
 * @apiBody {String} [autoLogin=false] in case value passed is true, then after user creation access_token will be provided by performing automatic login.
 *
 *
 * @apiSuccess (Success 201) {String} msg message from the server
 * @apiSuccess (Success 201) {Object} data
 * @apiSuccess (Success 201) {Object} data.user newly created user details
 * @apiSuccess (Success 201) {String} data.user.user_id
 * @apiSuccess (Success 201) {String} data.user.firstname
 * @apiSuccess (Success 201) {String} data.user.lastname
 * @apiSuccess (Success 201) {String} data.user.email
 * @apiSuccess (Success 201) {String} data.user.role
 * @apiSuccess (Success 201) {String} data.user.access_token available only if autoLogin is passed as true
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 201 Created
 *      {
 *        "msg": "User created",
 *        "data": {
 *           "user": {
 *              "user_id": "629d1871b031f552165a255f",
 *              "firstname": "Shivam",
 *              "lastname": "Patel",
 *              "email": "shivam@gmail.com",
 *              "role": "Normal",
 *              "access_token": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2..."
 *           }
 *         }
 *       }
 *
 *
 * @apiError (Bad Request 400) InvalidJSON Incoming json payload is invalid
 * @apiError (Bad Request 400) InvalidUserRole user role in request payload is invalid
 *
 * @apiError (Conflict 409) UserAlreadyExist user with same email address already exist in the database
 *
 * @apiErrorExample {json} General-Response:
 *     {
 *       "error": "error message"
 *     }
 *
 */
router.post('/', userService.createUser)

/**
 * @api {post} /user/login Login
 * @apiVersion 1.0.0
 * @apiName LoginUser
 * @apiGroup User
 *
 * @apiBody {String} email
 * @apiBody {String} password
 *
 *
 * @apiSuccess (Success 200) {String} msg message from the server
 * @apiSuccess (Success 200) {Object} data
 * @apiSuccess (Success 200) {Object} data.user newly created user details
 * @apiSuccess (Success 200) {String} data.user.user_id
 * @apiSuccess (Success 200) {String} data.user.firstname
 * @apiSuccess (Success 200) {String} data.user.lastname
 * @apiSuccess (Success 200) {String} data.user.email
 * @apiSuccess (Success 200) {String} data.user.role
 * @apiSuccess (Success 200) {String} data.user.access_token access token starts with "Bearer "
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *        "msg": "Login Successful",
 *        "data": {
 *           "user": {
 *              "user_id": "629d1871b031f552165a255f",
 *              "firstname": "Shivam",
 *              "lastname": "Patel",
 *              "email": "shivam@gmail.com",
 *              "role": "Normal",
 *              "access_token": "Bearer eyJhbGciOiJIUzI..."
 *           }
 *         }
 *       }
 *
 *
 * @apiError (Bad Request 400) InvalidJSON Incoming json payload is invalid
 * @apiError (Bad Request 400) InvalidJSON Missing or invalid json payload properties
 *
 * @apiError (Unauthorized 401) InvalidCredentials Wrong email or password
 *
 * @apiErrorExample {json} General-Response:
 *     {
 *       "error": "error message"
 *     }
 *
 */
router.post('/login', userService.userLogin)

/**
 * @api {delete} /user/file/file_id Delete File
 * @apiVersion 1.0.0
 * @apiName Delete File
 * @apiGroup User
 *
 * @apiDescription Will delete user file.
 *
 * @apiHeader {String} authorization JWT
 *
 * @apiQuery file_id
 *
 *
 * @apiSuccess (Success 200) {String} msg message from the server
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *        "msg": "Success",
 *      }
 *
 *
 *
 * @apiError (Not Found 400) InvalidFileId Invalid file_id
 *
 * @apiErrorExample {json} General-Response:
 *     {
 *       "error": "error message"
 *     }
 *
 */
router.delete('/file/:file_id', auth(['Normal']), userService.deleteFile)

/**
 * @api {get} /user/files Uploaded-Files
 * @apiVersion 1.0.0
 * @apiName FileRequests
 * @apiGroup User
 *
 * @apiDescription Returns all files which are uploaded by user
 * 
 * @apiHeader {String} authorization JWT
 *
 * @apiSuccess (Success 200) {String} msg message from the server
 * @apiSuccess (Success 200) {Object} data
 * @apiSuccess (Success 200) {Object[]} data.files
 * @apiSuccess (Success 200) {String} data.files.file_id
 * @apiSuccess (Success 200) {String} data.files.filename
 * @apiSuccess (Success 200) {String} data.files.mimetype
 * @apiSuccess (Success 200) {String} data.files.size
 * @apiSuccess (Success 200) {String} data.files.uploadedOn
 * @apiSuccess (Success 200) {String} data.files.downloadUrl
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *        "msg": "Success",
 *        "data": {
 *           "files": [
                        {
                            "file_id": "62b200946011df31982005e1",
                            "filename": "pic.jpg",
                            "mimetype": "image/jpeg",
                            "size": "211 KB",
                            "uploadedOn": "Tuesday, 21 June 2022",
                            "downloadUrl": "/Ff42FxbHWzY0StvxVJkV"
                        },
                        {
                            "file_id": "62b2070eefb25ea0acaedb45",
                            "filename": "pdf-test.pdf",
                            "mimetype": "application/pdf",
                            "size": "20 KB",
                            "uploadedOn": "Tuesday, 21 June 2022",
                            "downloadUrl": "/bsCuNOQT880vufSmmeKi"
                        }
                ]
            }
        }
 *
 *
 *
 */
router.get('/files', auth(['Normal']), userService.getUserFiles)

// module level exception handling middleware
router.use(userExceptionHandler)

module.exports = router
