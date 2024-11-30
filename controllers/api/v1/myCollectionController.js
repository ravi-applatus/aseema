const models = require('../../../models');
var multiparty = require('multiparty');
const flash = require('connect-flash');
const Sequelize = require('sequelize');
const Op = Sequelize.Op
const fs = require("fs");
const { product } = require('./articleCategoryController');
const { log } = require('console');
require('dotenv').config();



exports.myCollectonadd = async (req, res) => {
    let customerId = req.body.customerId;
    let productId = req.body.productId;
    const validuser = await models.Customers.findOne({
        attributes: ['id'],
        where: { id: customerId }
    });
    if (!validuser) {
        return res.status(404).send({ data: { success: false, message: "User not found" }, errorNode: { errorCode: 1, errorMsg: "User not found" } });
    } else {
        var product = await models.Product.findOne({
            attributes: ['id', 'likeCount'],
            where: { id: productId }
        });
        if (!product) {
            return res.status(404).send({
                data: { success: false, message: "Product not found" }, errorNode: { errorCode: 1, errorMsg: "Product not found" }
            });
        } else {
            const existingProduct = await models.Mycollection.findOne({
                where: { customerId: customerId, productId: productId }
            });
            if (existingProduct) {
                return res.status(404).send({
                    data: { success: false, message: "Product allready exist" }, errorNode: { errorCode: 1, errorMsg: "Product allready exist" }
                });
            } else {
                var initialLikeCount = product.likeCount;
                var finalLikeCount = (Number(initialLikeCount) + 1)
                await models.Product.update(
                    { likeCount: finalLikeCount },
                    { where: { id: productId } }
                );
                await models.Mycollection.create({
                    customerId: customerId,
                    productId: productId,
                    createdBy: customerId
                }).then((data) => {
                    if (data && data.id > 0) {
                        return res.status(200).send({ success: true, data: data, message: "My Collection Add successfully.", errorNode: { errorCode: 0, errorMsg: "No error" } });
                    } else {
                        return res.status(200).send({ success: false, message: "My Collection Add failed.", errorNode: { errorCode: 1, errorMsg: err } });
                    };
                });
            };
        };
    };
};

exports.myCollectonList = async (req, res) => {
    let customerId = req.body.customerId;
    try {
        const valid_user = await models.Customers.findOne({
            attributes: ['id'],
            where: { id: customerId }
        });
        if (!valid_user) {
            return res.status(404).send({ data: { success: false, message: "User not found" }, errorNode: { errorCode: 1, errorMsg: "User not found" } });
        } else {
            const Collectionid = await models.Mycollection.findAll({
                attributes: ['id', 'customerId', 'productId'],
                where: { customerId: customerId }
            });
            const productIds = Collectionid.map(collection => collection.productId);
            const productList = [];
            for (let productId of productIds) {
                const productDetails = await models.Product.findAll({
                    attributes: [
                        'id',
                        'type',
                        'title',
                        'subscription',
                        'thumbnail_portrait'
                    ],
                    where: { id: productId }
                });
                if (productDetails) {
                    for (var j = 0; j < productDetails.length; j++) {
                        productList.push({
                            "id": productDetails[j].id,
                            "type": productDetails[j].type,
                            "title": productDetails[j].title,
                            "subscription": productDetails[j].subscription,
                            "thumbnail_portrait": (productDetails[j].thumbnail_portrait != '' && productDetails[j].thumbnail_portrait != null) ? req.app.locals.baseurl + 'admin/contents/product/' + productDetails[j].thumbnail_portrait : req.app.locals.baseurl + 'admin/contents/product/no_image.jpg',
                        });
                    }
                }
            }
            if (productList.length>0) {


const articalProductList= [];
const emegazineProductProductList= [];

for(let i = 0;i<productList.length; i++){
let product=productList[i]
    // console.log(product);
    if(product.type=='emagazine'){
        emegazineProductProductList.push(product)
    }else if(product.type=='article'){
        articalProductList.push(product)
    }
}


// productList: productList,

                return res.status(200).send({ success: true,emegazineProductProductList:emegazineProductProductList, articalProductList:articalProductList, errorNode: { errorCode: 0, errorMsg: "No error" } });
            } else {
                return res.status(200).send({
                    success: false,
                    productList: [],
                    message: "NO Product found",
                    errorNode: {
                        errorCode: 1,
                        errorMsg: "NO Product found"
                    }
                });
            }
            
        }
    } catch (error) {
        console.log(error);
        return res.status(200).send({ success: false, errorNode: { errorCode: 1, errorMsg: err } });
    }
};


exports.myCollectonDelete = async (req, res) => {
    let customerId = req.body.customerId;
    let productId = req.body.productId;
    const validUser = await models.Customers.findOne({
        attributes: ['id'],
        where: { id: customerId }
    });
    if (!validUser) {
        return res.status(404).send({ data: { success: false, message: "User not found" }, errorNode: { errorCode: 1, errorMsg: "User not found" } });
    } else {
        const productCollection = await models.Mycollection.findAll({
            attributes: ['id', 'customerId', 'productId'],
            where: { customerId: customerId, productId: productId }
        });
        if (productCollection.length > 0) {
            await models.Mycollection.destroy({
                where: { customerId: customerId, productId: productId }
            });
            var product = await models.Product.findOne({
                attributes: ['id', 'likeCount'],
                where: { id: productId }
            });
            var initialLikeCount = product.likeCount;
            var finalLikeCount = (Number(initialLikeCount) - 1)
            await models.Product.update(
                { likeCount: finalLikeCount },
                { where: { id: productId } }
            );
            return res.status(200).send({
                success: true, productCount: productCollection.length, message: "Deleted Successfully", errorNode: { errorCode: 0, errorMsg: "No error" }
            });
        } else {
            return res.status(404).send({ data: { success: false, message: "product not found" }, errorNode: { errorCode: 1, errorMsg: "product not found" } });
        };
    };
};