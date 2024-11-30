const models = require('../../models');
const flash = require('connect-flash');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
var multiparty = require('multiparty');
var utility = require("../../utils/utility");
const fs = require("fs");
const { log } = require('console');
require('dotenv').config();
var cron = require('node-cron');


/**
 * Get the list of the categoies
 * @param {*} req 
 * @param {*} res 
 * @param {*} next 
 * @returns 
 */




/* exports.list = async(req, res) => {
    res.render("admin/product/list", {
        title: "Product List",

        messages: req.flash("info"),
        errors: req.flash("error"),
    });
} */


// cron.schedule('* * * * *', async () => {
//     try {
//       const currentTime = new Date();
//         // const currentTime = new Date().toISOString().split("T")[0];
//       const products = await models.Product.findAll({
//         attributes: ['id', 'status', 'published_datetime'],
//         where: {
//           published_datetime: {
//             [Op.gte]: currentTime, 
//           },
//         },
//       });
//       console.log("1111111111111111111111111");
//       console.log(products);
//       console.log(products.id)
  
//       for (let product of products) {
//         console.log("222222222222222");
//         console.log(product.id)
//         // if (product.published_datetime == currentTime && product.status == 'scheduled') {
//             if (product.published_datetime >= currentTime && product.status !== 'published') {
//           product.status = 'published';
//           await models.Product.update({
//             status:"published",
//             published_datetime:product.published_datetime
//           },{
//             where: { id: product.id }, 
//           }).then((data)=>{
//             console.log("333333333333333333333333");
//             console.log(data);
//             if(data){
//                 console.log('Status updated successfully');
//             }
//           })
//         }
//       }
  
      
//     } catch (error) {
//       console.error('Error updating status:', error);
//     }
//   });
  
  
  
  
  
  
  

exports.list = async (req, res) => {
    let search = req.query.searchText ? req.query.searchText : '';
    let pagesizes = req.query.pagesize || 10;
    let pageSize = parseInt(pagesizes);
    let page = req.params.page || 1;
    var selectedType = req.query.type ? req.query.type : "";
    var selectedSubscription = req.query.subscription ? req.query.subscription : "";
    var selectedStatus = req.query.status ? req.query.status : "";
    let whereCondition = {}
    if (selectedType && selectedType != 'all') whereCondition.type = selectedType
    if (selectedSubscription && selectedSubscription != 'all') whereCondition.subscription = selectedSubscription
    if (selectedStatus && selectedStatus != 'all') whereCondition.status = selectedStatus
    if (search) {
        whereCondition.title = { [Op.like]: `%${search}%` };
    }
    // whereCondition = {
    //     [Op.or]: [
    //         { title: { [Op.like]: `%${search}%` } },
    //     ]
    // }
    let productList = await models.Product.findAll({
        attributes: ['id', 'title', 'short_description', 'subscription', 'type', 'status'],
        order: [
            ["id", "Desc"]
        ], where: whereCondition, limit: pageSize, offset: (page - 1) * pageSize
    });
    let listCount = await models.Product.count({
        where: {
            [Op.or]: [
                { title: { [Op.like]: `%${search}%` } }
            ]
        }
    });
    let pageCount = Math.ceil(listCount / pageSize);
    res.render("admin/product/list", {
        title: "Product List",
        productList: productList,
        listCount: listCount,
        pageCount: pageCount,
        pageSize: pageSize,
        currentPage: parseInt(page),
        searchItem: search,
        selectedType: selectedType,
        selectedSubscription: selectedSubscription,
        selectedStatus: selectedStatus,
        messages: req.flash("info"),
        errors: req.flash("error"),
    });
}


// exports.form1 = async (req, res) => {
//     const type = req.params.type;
//     var product = "";
//     var id = req.params.id;
//     var category = await models.Category.findAll({
//         attributes: ['id', 'name', 'type'],
//     });
//     if (id && id > 0) {
//         const details = await getProductById(id);
//         if (details.product != null) {
//             res.render("admin/product/form", {
//                 title: (product != "" ? 'Update product' : 'Create product'),
//                 type: type,
//                 categories: category,
//                 product: details.product,
//                 type_title: (type == "emagazine" ? "E-Magazine" : type),
//                 messages: req.flash("info"),
//                 errors: req.flash("error"),
//             });
//         }
//     } else {
//         res.render("admin/product/form", {
//             title: (product != "" ? 'Update product' : 'Create product'),
//             type: type,
//             categories: category,
//             product: [],
//             type_title: (type == "emagazine" ? "E-Magazine" : type),
//             messages: req.flash("info"),
//             errors: req.flash("error"),
//         });
//     }
// }

exports.form = async (req, res) => {
    const type = req.params.type;
    var product = "";
    var id = req.params.id;
    var categories = await models.Category.findAll({
        attributes: ['id', 'name', 'type'],
    });
    if (id && id > 0) {
        const details = await getProductById(id);
        if (details.product != null) {
            res.render("admin/product/form", {
                title: (product != "" ? 'Update product' : 'Create product'),
                type: type,
                categories: categories,
                product: details.product,
                type_title: (type == "emagazine" ? "E-Magazine" : type),
                messages: req.flash("info"),
                errors: req.flash("error"),
            });
        }
    } else {
        res.render("admin/product/form", {
            title: (product != "" ? 'Update product' : 'Create product'),
            type: type,
            categories: categories,
            product: [],
            type_title: (type == "emagazine" ? "E-Magazine" : type),
            messages: req.flash("info"),
            errors: req.flash("error"),
        });
    }
}



exports.getCategory = async function (req, res) {
    const selectedType = req.query.type;
    var category = await models.Category.findAll({
        attributes: ['id', 'name', 'type'],
        where: { type: selectedType }
    });

    res.json({ category });



}

/* exports.form = async(req, res) => {
    const type = req.params.type;
    //const isValid = await checkTypeValidation(type);
    const isValid = true;
    var product = "";
    var category = [];
    let productCategories = "";

    var id = req.params.id;
    if (id && id > 0) {
        const details = await getProductById(id);
        if (details.product != null)
            product = details.product;
        category = details.category;
        productCategories = details.productCategories;
        console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
        console.log(category);
        // console.log(details);
        // console.log("321111111111111111");
        // console.log(product);
        // console.log("7899999999999999999999");
        // console.log(productCategories);
    }

    if (isValid) {
        res.render("admin/product/form", {
            title: "",
            type: type,
            categories: category,
            product: product,
            productCategories: productCategories,
            type_title: (type == "emagazine" ? "E-Magazine" : type),
            messages: req.flash("info"),
            errors: req.flash("error"),
        });
    } else {
        req.flash("error", "Invalid product type! Please try again.");
        return res.redirect("/admin/product/list");
    }
} */


async function checkTypeValidation(type) {
    if (type != "") {
        //const type_details = await models.
    }
}




exports.saveOrUpdate = async (req, res) => {
    var form = new multiparty.Form();
    form.parse(req, async function (err, fields, files) {
        var id = parseInt(fields.id[0]);
        var resp = "";
        var action = "";
        if (id > 0) {
            action = "update";
            resp = await updateRecord(id, req, fields, files);
        } else {
            action = "create";
            resp = await createRecord(req, fields, files);
            if (resp.success) id = resp.id;
        }


        var type = "info";
        var message = resp.message;
        if (resp.error != "") {
            type = "error";
            message = resp.error;
        }
        req.flash(type, message);
        if (type == "error") {
            return res.redirect('back');
        }

        return res.redirect('/admin/product/list');
    })
}


async function createRecord(req, fields, files) {
    return new Promise(async (resolve, reject) => {
        if (fields.title[0] != '') {
            await models.Product.create({
                // category_id: fields.category_id[0] ? fields.category_id[0] : null,
                category_id: fields.type[0] == "article" ? fields.category_id[0] : null,
                title: fields.title[0],
                short_description: fields.short_description[0],
                // content: fields.content[0],
                content: fields.type[0] == "article" || fields.type[0] == "news" ? fields.content[0] : null,
                type: fields.type[0],
                slug: await utility.sanitizeString(fields.title[0]),
                subscription: fields.subscription[0],
                tags: fields.type[0]=="news" ? fields.tags[0] : null,
                published_datetime: fields.published_datetime[0],
                meta_title: fields.meta_title[0],
                meta_description: fields.meta_description[0],
                meta_keywords: fields.meta_keywords[0],
                og_title: fields.og_title[0],
                og_type: fields.og_type[0],
                og_url: fields.og_url[0],
                status: fields.status[0],
                created_at: Sequelize.fn('NOW'),
                created_by: 1,
            }).then(async (data) => {
                if (data && data.id > 0) {
                    if (files.thumbnail_landscape[0].originalFilename != '' && files.thumbnail_landscape[0].originalFilename != null) {
                        let thumbnail_landscapeImage = Date.now() + files.thumbnail_landscape[0].originalFilename;
                        let ImageExt = thumbnail_landscapeImage.split('.').pop();
                        let thumbnail_landscapeImageWithEXT = Date.now() + files.thumbnail_landscape[0] + "." + ImageExt;
                        var userFinalthumbnail_landscape = thumbnail_landscapeImageWithEXT.replace("[object Object]", "");
                        utility.createDirectory('public/admin/contents/product');
                        let temp_path = files.thumbnail_landscape[0].path;
                        let fileName = userFinalthumbnail_landscape;
                        let target_path = fileName;
                        await utility.uploadthumbnailImageFiles(temp_path, target_path);
                    }
                    if (files.thumbnail_portrait[0].originalFilename != '' && files.thumbnail_portrait[0].originalFilename != null) {
                        let thumbnail_portraitImage = Date.now() + files.thumbnail_portrait[0].originalFilename;
                        let ImageExt = thumbnail_portraitImage.split('.').pop();
                        let thumbnail_portraitImageWithEXT = Date.now() + files.thumbnail_portrait[0] + "." + ImageExt;
                        var userFinalthumbnail_portrait = thumbnail_portraitImageWithEXT.replace("[object Object]", "");
                        utility.createDirectory('public/admin/contents/product');
                        let temp_path = files.thumbnail_portrait[0].path;
                        let fileName = userFinalthumbnail_portrait;
                        let target_path = fileName;
                        await utility.uploadthumbnailImageFiles(temp_path, target_path);
                    }
                    if (files.og_image[0].originalFilename != '' && files.og_image[0].originalFilename != null) {
                        let og_imageImage = Date.now() + files.og_image[0].originalFilename;
                        let ImageExt = og_imageImage.split('.').pop();
                        let og_imageImageWithEXT = Date.now() + files.og_image[0] + "." + ImageExt;
                        var userFinalog_image = og_imageImageWithEXT.replace("[object Object]", "");
                        utility.createDirectory('public/admin/contents/product');
                        let temp_path = files.og_image[0].path;
                        let fileName = userFinalog_image;
                        let target_path = fileName;
                        await utility.uploadthumbnailImageFiles(temp_path, target_path);
                    }
                    if (files.audio[0].originalFilename != '' && files.audio.length > 0 && files.audio[0].originalFilename != null) {
                        let originalFilename = files.audio[0].originalFilename;
                        let fileExtension = originalFilename.split('.').pop();
                        var audioFile = Date.now() + '.' + fileExtension;
                        utility.createDirectory('public/admin/contents/product/audio');
                        let temp_path = files.audio[0].path;
                        let target_path = 'public/admin/contents/product/audio/' + audioFile;
                        await utility.uploadAudioFiles(temp_path, target_path);
                    }
                    if (files.magazine_preview[0].originalFilename != '' && files.magazine_preview[0].originalFilename != null) {
                        let magazine_previewImage = Date.now() + files.magazine_preview[0].originalFilename;
                        let ImageExt = magazine_previewImage.split('.').pop();
                        let magazine_previewImageWithEXT = Date.now() + files.magazine_preview[0] + "." + ImageExt;
                        var userFinalmagazine_preview = magazine_previewImageWithEXT.replace("[object Object]", "");
                        utility.createDirectory('public/admin/contents/product/pdf');
                        let temp_path = files.magazine_preview[0].path;
                        let fileName = userFinalmagazine_preview;
                        let target_path = fileName;
                        await utility.uploadthumbnailPDFFiles(temp_path, target_path);
                    }
                    if (files.magazine_full[0].originalFilename != '' && files.magazine_full[0].originalFilename != null) {
                        let magazine_fullImage = Date.now() + files.magazine_full[0].originalFilename;
                        let ImageExt = magazine_fullImage.split('.').pop();
                        let magazine_fullImageWithEXT = Date.now() + files.magazine_full[0] + "." + ImageExt;
                        var userFinalmagazine_full = magazine_fullImageWithEXT.replace("[object Object]", "");
                        utility.createDirectory('public/admin/contents/product/pdf');
                        let temp_path = files.magazine_full[0].path;
                        let fileName = userFinalmagazine_full;
                        let target_path = fileName;
                        await utility.uploadthumbnailPDFFiles(temp_path, target_path);
                    }

                    await createOrUpdateProductCategories(data.id, fields.category);
                    await models.Product.update({
                        thumbnail_landscape: userFinalthumbnail_landscape,
                        thumbnail_portrait: userFinalthumbnail_portrait,
                        og_image: userFinalog_image,
                        audio: fields.type[0] == "emagazine" ? audioFile :null,
                        magazine_preview: fields.type[0] == "emagazine" ? userFinalmagazine_preview : null,
                        magazine_full: fields.type[0] == "emagazine" ? userFinalmagazine_full : null
                    }, { where: { id: data.id } }).then(function (val) {
                        if (val) {
                            resolve({ "success": true, "id": val.id, "error": "", "message": fields.type[0] + " created successfully." });
                        }
                    })
                } else {
                    resolve({ "success": false, "error": "Failed to create " + fields.type[0] + "! Please try again.", "message": "" });
                }
            }).catch((error) => {
                console.log(error)
                resolve({ "success": false, "error": "We are facing some technical issue! Please try again.", "message": "" });
            });

        }
    })
}

async function updateRecord(id, req, fields, files) {
    return new Promise(async (resolve, reject) => {
        let productImageList = await models.Product.findOne({ attributes: ['thumbnail_landscape', 'thumbnail_portrait', 'og_image', 'audio', 'magazine_preview'], where: { id: fields.id[0] } });
        if (files.thumbnail_landscape[0].originalFilename != '' && files.thumbnail_landscape[0].originalFilename != null) {
            let thumbnail_landscapeImage = Date.now() + files.thumbnail_landscape[0].originalFilename;
            let ImageExt = thumbnail_landscapeImage.split('.').pop();
            let thumbnail_landscapeImageWithEXT = Date.now() + files.thumbnail_landscape[0] + "." + ImageExt;
            var userFinalthumbnail_landscape = thumbnail_landscapeImageWithEXT.replace("[object Object]", "");
            utility.createDirectory('public/admin/contents/product');
            let temp_path = files.thumbnail_landscape[0].path;
            let fileName = userFinalthumbnail_landscape;
            let target_path = fileName;
            await utility.uploadthumbnailImageFiles(temp_path, target_path);
        }
        if (files.thumbnail_portrait[0].originalFilename != '' && files.thumbnail_portrait[0].originalFilename != null) {
            let thumbnail_portraitImage = Date.now() + files.thumbnail_portrait[0].originalFilename;
            let ImageExt = thumbnail_portraitImage.split('.').pop();
            let thumbnail_portraitImageWithEXT = Date.now() + files.thumbnail_portrait[0] + "." + ImageExt;
            var userFinalthumbnail_portrait = thumbnail_portraitImageWithEXT.replace("[object Object]", "");
            utility.createDirectory('public/admin/contents/product');
            let temp_path = files.thumbnail_portrait[0].path;
            let fileName = userFinalthumbnail_portrait;
            let target_path = fileName;
            await utility.uploadthumbnailImageFiles(temp_path, target_path);
        }
        if (files.og_image[0].originalFilename != '' && files.og_image[0].originalFilename != null) {
            let og_imageImage = Date.now() + files.og_image[0].originalFilename;
            let ImageExt = og_imageImage.split('.').pop();
            let og_imageImageWithEXT = Date.now() + files.og_image[0] + "." + ImageExt;
            var userFinalog_image = og_imageImageWithEXT.replace("[object Object]", "");
            utility.createDirectory('public/admin/contents/product');
            let temp_path = files.og_image[0].path;
            let fileName = userFinalog_image;
            let target_path = fileName;
            await utility.uploadthumbnailImageFiles(temp_path, target_path);
        }
        if (files.audio && files.audio.length > 0 && files.audio[0].originalFilename != null && files.audio[0].originalFilename != '') {
            let originalFilename = files.audio[0].originalFilename;
            let fileExtension = originalFilename.split('.').pop();
            var audioFile = Date.now() + '.' + fileExtension;
            utility.createDirectory('public/admin/contents/product/audio');
            let temp_path = files.audio[0].path;
            let target_path = 'public/admin/contents/product/audio/' + audioFile;
            await utility.uploadAudioFiles(temp_path, target_path);
        }
        if (files.magazine_preview[0].originalFilename != '' && files.magazine_preview[0].originalFilename != null) {
            let magazine_previewImage = Date.now() + files.magazine_preview[0].originalFilename;
            let ImageExt = magazine_previewImage.split('.').pop();
            let magazine_previewImageWithEXT = Date.now() + files.magazine_preview[0] + "." + ImageExt;
            var userFinalmagazine_preview = magazine_previewImageWithEXT.replace("[object Object]", "");
            utility.createDirectory('public/admin/contents/product/pdf');
            let temp_path = files.magazine_preview[0].path;
            let fileName = userFinalmagazine_preview;
            let target_path = fileName;
            await utility.uploadthumbnailPDFFiles(temp_path, target_path);
        }
        if (files.magazine_full[0].originalFilename != '' && files.magazine_full[0].originalFilename != null) {
            let magazine_fullImage = Date.now() + files.magazine_full[0].originalFilename;
            let ImageExt = magazine_fullImage.split('.').pop();
            let magazine_fullImageWithEXT = Date.now() + files.magazine_full[0] + "." + ImageExt;
            var userFinalmagazine_full = magazine_fullImageWithEXT.replace("[object Object]", "");
            utility.createDirectory('public/admin/contents/product/pdf');
            let temp_path = files.magazine_full[0].path;
            let fileName = userFinalmagazine_full;
            let target_path = fileName;
            await utility.uploadthumbnailPDFFiles(temp_path, target_path);
        }

        let oldthumbnail_landscapeImage = productImageList.thumbnail_landscape
        let oldThumbnail_portraitImage = productImageList.thumbnail_portrait
        let oldUserFinalog_image = productImageList.og_image
        let oldAudioFil = productImageList.audio
        let oldmagazine_preview = productImageList.magazine_preview
        let olidmagazine_full = productImageList.magazine_full

        await models.Product.update({
            // category_id: fields.category_id[0] ? fields.category_id[0] : null,
            category_id: fields.type[0] == "article" ? fields.category_id[0] : null,
            title: fields.title[0],
            short_description: fields.short_description[0],
            // content: fields.content[0],
            content: fields.type[0] == "article" || fields.type[0] == "news" ? fields.content[0] : null,
            type: fields.type[0],
            subscription: fields.subscription[0],
            tags: fields.type[0]=="news" ? fields.tags[0] : null,
            published_datetime: fields.published_datetime[0],
            meta_title: fields.meta_title[0],
            meta_description: fields.meta_description[0],
            meta_keywords: fields.meta_keywords[0],
            status: fields.status[0],
            og_title: fields.og_title[0],
            og_type: fields.og_type[0],
            og_url: fields.og_url[0],
            updated_at: Sequelize.fn('NOW'),
            updated_by: 1,
            thumbnail_landscape: userFinalthumbnail_landscape ? userFinalthumbnail_landscape : oldthumbnail_landscapeImage,
            thumbnail_portrait: userFinalthumbnail_portrait ? userFinalthumbnail_portrait : oldThumbnail_portraitImage,
            og_image: userFinalog_image ? userFinalog_image : oldUserFinalog_image,
            audio: fields.type[0] == "emagazine" ? audioFile ? audioFile : oldAudioFil : null,
            magazine_preview: fields.type[0] == "emagazine" ? userFinalmagazine_preview ? userFinalmagazine_preview : oldmagazine_preview : null,
            magazine_full: fields.type[0] == "emagazine" ? userFinalmagazine_full ? userFinalmagazine_full : olidmagazine_full : null
        }, { where: { id: fields.id[0] } }).then((affected_rows) => {
            if (affected_rows > 0) {
                resolve({ "success": true, "error": "", "message": " updated successfully." });
            } else {
                resolve({ "success": false, "error": "Failed to update ", "message": "" });
            }
        }).catch((error) => {
            console.log(error)
            resolve({ "success": false, "error": "We are facing some technical issue! Please try again.", "message": "" });
        });

    })
}



async function createOrUpdateProductCategories(id, category) {
    models.ProductCategory.destroy({
        where: { product_id: id }
    }).then((affected_rows) => {
        for (let i = 0; i < category.length; i++) {
            models.ProductCategory.create({
                product_id: id,
                category_id: category[i],
                created_at: Sequelize.fn('NOW'),
                created_by: 1,
            });
        }
    })
}



async function getProductById(id) {
    return new Promise(async (resolve, reject) => {
        if (id > 0) {
            var product = await models.Product.findOne({
                where: { id: id },
            });

            //const productCategories = await models.ProductCategory.findOne({ attributes: ["category_id"], where: { product_id: id } });
            //  var category = await models.Category.findAll({ attributes: ['id', 'name', 'type'], where: { id: product.category_id } })
           

            resolve({ "product": product});
        }
        resolve("");
    });
}



async function deleteFile(filename, filename1, filename2) {
    //Delete if any existing file exists with different name
    if (filename != "" && filename1 != "" && filename2 != "") {
        try {
            fs.unlinkSync('./public/contents/product/' + filename);
            fs.unlinkSync('./public/contents/product/' + filename1);
            fs.unlinkSync('./public/contents/product/' + filename2);

            console.log("File deleted successfully.");
        } catch (error) {
            console.log(error);
        }
    }
}

