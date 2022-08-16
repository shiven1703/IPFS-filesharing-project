const express = require('express')
const auth = require('../../middleware/auth')
const adminService = require('./admin.service')
const adminExceptionHandler = require('./exception')

const router = express.Router()

/**
 * @api {post} /admin/login Login
 * @apiVersion 1.0.0
 * @apiName LoginAdmin
 * @apiGroup Admin
 *
 * @apiBody {String} email
 * @apiBody {String} password
 *
 *
 * @apiSuccess (Success 200) {String} msg message from the server
 * @apiSuccess (Success 200) {Object} data
 * @apiSuccess (Success 200) {Object} data.user Admin details
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
 *              "firstname": "Admin",
 *              "lastname": "Admin",
 *              "email": "admin@gmail.com",
 *              "role": "Admin",
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
router.post('/login', adminService.adminLogin)

/**
 * @api {get} /admin/requests File Requests
 * @apiVersion 1.0.0
 * @apiName File Requests
 * @apiGroup Admin
 * @apiDescription Return all pending requests realted to file blocking & unblocking for admin user
 *
 *
 * @apiHeader {String} authorization jwt token for admin
 * 
 * @apiSuccess (Success 200) {String} msg message from the server
 * @apiSuccess (Success 200) {Object} data
 * @apiSuccess (Success 200) {Object[]} data.requests Admin details
 * @apiSuccess (Success 200) {String} data.requests.request_id
 * @apiSuccess (Success 200) {String} data.requests.file_id
 * @apiSuccess (Success 200) {String} data.requests.type 'Block' or 'Unblock'
 * @apiSuccess (Success 200) {String} data.requests.reason
 * @apiSuccess (Success 200) {Number} data.requests.approvalStatus -1 = decision_pedning || 1 = Approved || 0 = Rejected
 * @apiSuccess (Success 200) {Object} data.requests.file_details
 * @apiSuccess (Success 200) {String} data.requests.file_details.filename
 * @apiSuccess (Success 200) {String} data.requests.file_details.mimetype
 * @apiSuccess (Success 200) {String} data.requests.file_details.size
 * @apiSuccess (Success 200) {String} data.requests.file_details.uploadedOn
 * @apiSuccess (Success 200) {String} data.requests.file_details.lastDownloadedOn
 * @apiSuccess (Success 200) {String} data.requests.file_details.downloadUrl
 * @apiSuccess (Success 200) {Object} data.requests.user_details
 * @apiSuccess (Success 200) {String} data.requests.user_details.firstname
 * @apiSuccess (Success 200) {String} data.requests.user_details.lastname
 * @apiSuccess (Success 200) {String} data.requests.user_details.email
 * 
 *
 *
 *
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
        {
            "msg": "Success",
            "data": {
                "requests": [
                    {
                        "request_id": "62ae2db7783ae801f28e0db2",
                        "file_id": "akjdbcshvbsjhvbsdvjsvhjs",
                        "type": "Block",
                        "reason": "svjkbsjkv",
                        "approvalStatus": -1,
                        "file_details": {
                            "filename": "pic.jpg",
                            "mimetype": "image/jpeg",
                            "size": "211 KB",
                            "uploadedOn": "Saturday, 18 June 2022",
                            "lastDownloadedOn": "Saturday, 18 June 2022",
                            "downloadUrl": "/JgMMqdApQSQTEjklI2Wc"
                        },
                        "user_details": {
                            "firstname": "shivam",
                            "lastname": "patel",
                            "email": "shivam@gmail.com"
                        }
                    }
                ]
            }
        }
 *
 *
 *
 */
router.get('/requests', auth(['Admin']), adminService.getFileRequests)

/**
 * @api {post} /admin/request/process Request Processing
 * @apiVersion 1.0.0
 * @apiName Request Processing
 * @apiGroup Admin
 * @apiDescription Approve or Decline file request
 *
 * @apiBody {String} request_id
 * @apiBody {String} operation "Approve" or "Decline"
 * 
 * @apiHeader {String} authorization jwt token for admin
 * 
 * @apiSuccess (Success 200) {String} msg message from the server
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
        {
            "msg": "Success",
        }
 *
 * @apiError (Bad Request 400) InvalidFileId Invalid file id received
 * @apiErrorExample {json} General-Response:
 *     {
 *       "error": "error message"
 *     }
 *
 */
router.post('/request/process', auth(['Admin']), adminService.processFileRequest)

// module level exception handling middleware
router.use(adminExceptionHandler)

module.exports = router
