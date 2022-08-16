const express = require('express')
const fileService = require('./file.service')
const fileMiddleware = require('../../middleware/file')
const fileExceptionHandler = require('./exception')
const auth = require('../../middleware/auth')

const router = express.Router()

/**
 * @api {post} /file/upload File Upload
 * @apiVersion 1.0.0
 * @apiName Fileupload
 * @apiGroup File
 *
 * @apiHeader {String} authorization Bearer token ...it starts with "Bearer " prehold text and then jwt token
 *
 * @apiBody {File} files a multipart form field with name "files"
 *
 *
 * @apiSuccess (Success 200) {String} msg message from the server
 * @apiSuccess (Success 200) {Object} data
 * @apiSuccess (Success 200) {Object[]} data.files file details
 * @apiSuccess (Success 200) {String} data.files.filename
 * @apiSuccess (Success 200) {String} data.files.downloadUrl download url of uploaded file
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
            "msg": "Files uploaded",
            "data": {
                "files": [
                    {
                        "filename": "pdf-test.pdf",
                        "downloadUrl": "localhost:4000/file/download/ASx2mlt0p82Jw4RLnGsU"
                    },
                    {
                        "filename": "pic.jpg",
                        "downloadUrl": "localhost:4000/file/download/MSwSKj812rqlkTkwVIap"
                    }
                ]
            }
        }
 *
 *
 *
 * @apiError (BAD REQUEST 400) MissingFileParam Missing file field
 * @apiError (Conflict 409) DuplicateFile Cannot upload the same file again
 *
 * @apiErrorExample {json} General-Response:
 *     {
 *       "error": "error message"
 *     }
 *
 */
router.post(
  '/upload',
  auth(['Normal']),
  fileMiddleware,
  fileService.uploadFiles
)

/**
 * @api {get} /file/view/fileDownloadString View File - Metadata
 * @apiVersion 1.0.0
 * @apiName View File - Metadata
 * @apiGroup File
 *
 * @apiDescription On successful response...server will send a "Set-Cookie" header with the cookie name relay. This cookie is required while downloading the file and to mainly avoid hotlink download of the file.
 *
 * @apiQuery fileDownloadString the file download url string
 *
 *
 *
 * @apiSuccess (Success 200) {String} msg message from the server
 * @apiSuccess (Success 200) {Object} data
 * @apiSuccess (Success 200) {Object} data.file file details
 * @apiSuccess (Success 200) {String} data.file.file_id
 * @apiSuccess (Success 200) {String} data.file.filename
 * @apiSuccess (Success 200) {String} data.file.mimetype
 * @apiSuccess (Success 200) {String} data.file.size
 * @apiSuccess (Success 200) {String} data.file.uploadedOn
 * @apiSuccess (Success 200) {String} data.file.status "Blocked" or "Unblocked"
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *        "msg": "",
 *        "data": {
 *           "file": {
 *              "file_id": "sdjkvskdvbkvjsdbvksdvsdjkvwbsd",
 *              "filename": "test.pdf",
 *              "mimetype": "application/pdf",
 *              "size": "20 KB",
 *              "uploadedOn": "20 July 2022",
 *              "status": "Blocked"
 *           }
 *         }
 *       }
 *
 *
 *
 * @apiError (Not Found 404) InvalidDownloadURL file cannot be found due to invalid download url
 *
 * @apiErrorExample {json} General-Response:
 *     {
 *       "error": "error message"
 *     }
 *
 */
router.get('/view/:downloadUrlString', fileService.preDownload)

/**
 * @api {get} /file/download/fileDownloadString Download File
 * @apiVersion 1.0.0
 * @apiName Download File
 * @apiGroup File
 *
 * @apiDescription This request will require "relay" cookie.
 *
 * @apiQuery fileDownloadString the file download url string
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *
 *
 *
 * @apiError (Not Found 404) InvalidDownloadURL file cannot be found due to invalid download url
 * @apiError (Forbidden 403) FileBlocked Cannot download file. The current file status is "Blocked"
 *
 * @apiErrorExample {json} General-Response:
 *     {
 *       "error": "error message"
 *     }
 *
 */
router.get('/download/:downloadUrlString', fileService.downloadFile)

/**
 * @api {post} /file/request Block-Unblock request
 * @apiVersion 1.0.0
 * @apiName Block-Unblock Request
 * @apiGroup File
 *
 * @apiDescription use this endpoint to add file block or unblock request
 *
 * @apiHeader {String} authorization jwt of normal user
 *
 * @apiBody {String} file_id
 * @apiBody {String} request_type takes "Block" or "Unblock" as param
 * @apiBody {String} reason reason for request
 *
 * @apiSuccess (Success 200) {String} msg message from the server
 *
 * @apiSuccessExample {json} Success-Response:
 *      HTTP/1.1 200 OK
 *      {
 *        "msg": "Request successfully added"
 *       }
 *
 *
 *
 * @apiError (Bad Request 400) MissingParam missing request params
 * @apiError (Conflict 409) DuplicateFileRequest Request already added for this file
 * @apiError (Not Found 404) InvalidFileId invalid file_id supplied
 *
 * @apiErrorExample {json} General-Response:
 *     {
 *       "error": "error message"
 *     }
 *
 */
router.post('/request', auth(['Normal']), fileService.fileRequest)

// module level error handling middleware
router.use(fileExceptionHandler)

module.exports = router
