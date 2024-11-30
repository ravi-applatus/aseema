const models = require('../../../models');
var multiparty = require('multiparty');
const flash = require('connect-flash');
const Sequelize = require('sequelize');
const Op = Sequelize.Op
const fs = require("fs");
require('dotenv').config();

// var utility = require("../../../utils/utility");
var gtts = require('node-gtts')('en');
var path = require('path');


exports.category = async (req, res) => {
    const { Type } = req.body
    if (Type && Type != '' && Type != null) {
        let categoryList = await models.Category.findAll({ where: { status: 'active', type: Type } })
        let category = [];
        if (categoryList.length > 0) {
            for (var j = 0; j < categoryList.length; j++) {
                category.push({
                    "id": categoryList[j].id,
                    "name": categoryList[j].name,
                    "type": categoryList[j].type,
                    "status": categoryList[j].status,
                    "image": (categoryList[j].image != '' && categoryList[j].image != null) ? req.app.locals.baseurl + 'admin/category/' + categoryList[j].image : req.app.locals.baseurl + 'admin/category/no_image.jpg',
                });
            }
        }
        if (category.length > 0) {
            return res.status(200).send({
                success: true,
                details: category,
                errorNode: {
                    errorCode: 0,
                    errorMsg: "No Error"
                }
            });
        } else {
            return res.status(200).send({
                success: false,
                details: [],
                message: "NO category found",
                errorNode: {
                    errorCode: 1,
                    errorMsg: "NO category found"
                }
            });
        }
    } else {
        return res.status(200).send({
            success: false,
            details: [],
            message: "Type is require",
            errorNode: {
                errorCode: 1,
                errorMsg: "Type require"
            }
        });
    }

}


exports.productList = async (req, res) => {
    const categoryId = req.body.categoryId
    if (categoryId && categoryId != '' && categoryId != null) {
        let productList = await models.Product.findAll({
            attributes: ["id", "title", "category_id", "published_datetime", "subscription", "thumbnail_portrait"],
            where: { category_id: categoryId, status: 'published' },
            order: [['published_datetime', 'DESC']]
        })
        let catagoryName = await models.Category.findAll({
            attributes: ["id","name"],
            where: { id: categoryId },
        })
        let catagoryNamearray=[]
        let list = [];
        if (productList.length > 0) {
            for (var j = 0; j < productList.length; j++) {
                list.push({
                    "id": productList[j].id,
                    "title": productList[j].title,
                    "content": productList[j].content,
                    "subscription": productList[j].subscription,
                    "published_datetime": productList[j].published_datetime,
                    "thumbnail_portrait": (productList[j].thumbnail_portrait != '' && productList[j].thumbnail_portrait != null) ? req.app.locals.baseurl + 'admin/contents/product/' + productList[j].thumbnail_portrait : req.app.locals.baseurl + 'admin/contents/product/no_image.jpg',
                });
            }
        }
        console.log(catagoryName.length);
        if (catagoryName.length > 0) {
            for (var i = 0; i< catagoryName.length; i++) {
                catagoryNamearray.push({
                    "id": catagoryName[i].id,
                    "name": catagoryName[i].name,
                });
            }
        }
        if (list.length > 0 || catagoryNamearray.length > 0 ) {
            return res.status(200).send({
                success: true,
                catagoryNamearray:catagoryNamearray,
                details: list,
                errorNode: {
                    errorCode: 0,
                    errorMsg: "No Error"
                }
            });
        } else {
            return res.status(200).send({
                success: false,
                details: [],
                message: "NO Product found",
                errorNode: {
                    errorCode: 1,
                    errorMsg: "NO Product found"
                }
            });
        }
    } else {
        return res.status(200).send({
            success: false,
            details: [],
            message: "Category is require",
            errorNode: {
                errorCode: 1,
                errorMsg: "Category require"
            }
        });
    }
}


exports.product = async (req, res) => {
    const productId = req.body.productId
    const customerId=req.body.customerId || null
    if (productId && productId != '' && productId != null) {
        let product = await models.Product.findAll({
            attributes: ["id", "title", "content", "published_datetime", "thumbnail_landscape", "category_id"],
            where: { id: productId }
        })
       
        let relatedProductList=[];
        let productDetails = [];
        // if (existingProduct) {
            if (product.length > 0) {
                for (var j = 0; j < product.length; j++) {
                    let relatedProduct = await models.Product.findAll({
                        attributes: ["id", "title", "thumbnail_portrait", "category_id"],
                        where: {
                            id:{[Op.ne]:product[j].id},
                             category_id: product[j].category_id
                             },
                        order: [['id', 'DESC']],
                    })

                    
                    for (var i = 0; i < relatedProduct.length; i++) {
                        relatedProductList.push({
                            "id": relatedProduct[i].id,
                            "title": relatedProduct[i].title,
                            "thumbnail_portrait": (relatedProduct[i].thumbnail_portrait != '' && relatedProduct[i].thumbnail_portrait != null) ? req.app.locals.baseurl + 'admin/contents/product/' + relatedProduct[i].thumbnail_portrait : req.app.locals.baseurl + 'admin/contents/product/no_image.jpg',
                            
                        });
                    }
                    
                    let myCollectionData = false
                    if (customerId && customerId != null) {
                        const existingProduct = await models.Mycollection.findOne({
                            where: { customerId: customerId, productId: productId }
                        });
                        if (existingProduct) {
                            myCollectionData = true
                        }
                    }

                    productDetails.push({
                        "id": product[j].id,
                        "title": product[j].title,
                        "content": product[j].content,
                        "published_datetime": product[j].published_datetime,
                        "thumbnail_landscape": (product[j].thumbnail_landscape != '' && product[j].thumbnail_landscape != null) ? req.app.locals.baseurl + 'admin/contents/product/' + product[j].thumbnail_landscape : req.app.locals.baseurl + 'admin/contents/product/no_image.jpg',
                        "relatedProductList": relatedProductList,
                        "isMyCollection":myCollectionData
                    });
                }
            }
        // }else{
        //     if (product.length > 0) {
        //         for (var j = 0; j < product.length; j++) {
        //             let relatedProduct = await models.Product.findAll({
        //                 attributes: ["id", "title", "thumbnail_portrait", "category_id"],
        //                 where: {
        //                     id:{[Op.ne]:product[j].id},
        //                      category_id: product[j].category_id
        //                      },
        //                 order: [['id', 'DESC']],
        //             })
                    
        //             for (var i = 0; i < relatedProduct.length; i++) {
        //                 relatedProductList.push({
        //                     "id": relatedProduct[i].id,
        //                     "title": relatedProduct[i].title,
        //                     "thumbnail_portrait": (relatedProduct[i].thumbnail_portrait != '' && relatedProduct[i].thumbnail_portrait != null) ? req.app.locals.baseurl + 'admin/contents/product/' + relatedProduct[i].thumbnail_portrait : req.app.locals.baseurl + 'admin/contents/product/no_image.jpg',
                            
        //                 });
        //             }
        //             productDetails.push({
        //                 "id": product[j].id,
        //                 "title": product[j].title,
        //                 "content": product[j].content,
        //                 "published_datetime": product[j].published_datetime,
        //                 "thumbnail_landscape": (product[j].thumbnail_landscape != '' && product[j].thumbnail_landscape != null) ? req.app.locals.baseurl + 'admin/contents/product/' + product[j].thumbnail_landscape : req.app.locals.baseurl + 'admin/contents/product/no_image.jpg',
        //                 "relatedProductList": relatedProductList,
        //                 "isMyCollection":"false"
        //             });
        //         }
        //     }
        // }
        
        if (productDetails.length > 0) {
            return res.status(200).send({
                data: {
                    success: true,
                    details: productDetails
                },
                errorNode: {
                    errorCode: 0,
                    errorMsg: "No Error"
                }
            });
        } else {
            return res.status(200).send({
                data: {
                    success: false,
                    details: [],
                    message: "Product not found"
                },
                errorNode: {
                    errorCode: 1,
                    errorMsg: "Product not found"
                }
            });
        }
    }
}


exports.emegazineProduct = async (req, res) => {
    const { Type } = req.body
    if (Type && Type != '' && Type != null) {
        let emagazineMostLike = await models.Product.findAll({
            attributes: ["id", "title", "type", "subscription", "thumbnail_portrait", "status"],
            where: { type: Type, status: 'published' },
            order: [['likeCount', 'DESC']]
        })

        let emagazineMostLikeProductList = [];
        if (emagazineMostLike.length > 0) {
            for (var j = 0; j < emagazineMostLike.length; j++) {
                emagazineMostLikeProductList.push({
                    "id": emagazineMostLike[j].id,
                    "title": emagazineMostLike[j].title,
                    "subscription": emagazineMostLike[j].subscription,
                    "thumbnail_portrait": (emagazineMostLike[j].thumbnail_portrait != '' && emagazineMostLike[j].thumbnail_portrait != null) ? req.app.locals.baseurl + 'admin/contents/product/' + emagazineMostLike[j].thumbnail_portrait : req.app.locals.baseurl + 'admin/contents/product/no_image.jpg',
                });
            }
        }
        let emagazineLeast = await models.Product.findAll({
            attributes: ["id", "title", "type", "subscription", "thumbnail_portrait", "status"],
            where: { type: Type, status: 'published' },
            order: [['id', 'DESC']]
        })

        let emagazineLeastProductList = [];
        if (emagazineLeast.length > 0) {
            for (var j = 0; j < emagazineLeast.length; j++) {
                emagazineLeastProductList.push({
                    "id": emagazineLeast[j].id,
                    "title": emagazineLeast[j].title,
                    "subscription": emagazineLeast[j].subscription,
                    "thumbnail_portrait": (emagazineLeast[j].thumbnail_portrait != '' && emagazineLeast[j].thumbnail_portrait != null) ? req.app.locals.baseurl + 'admin/contents/product/' + emagazineLeast[j].thumbnail_portrait : req.app.locals.baseurl + 'admin/contents/product/no_image.jpg',
                });
            }
        }
        if (emagazineMostLikeProductList.length > 0 || emagazineLeastProductList > 0) {
            return res.status(200).send({
                success: true,
                likeProductList: emagazineMostLikeProductList,
                leastProductList: emagazineLeastProductList,
                errorNode: {
                    errorCode: 0,
                    errorMsg: "No Error"
                }
            });
        } else {
            return res.status(200).send({
                success: false,
                details: [],
                message: "NO Product found",
                errorNode: {
                    errorCode: 1,
                    errorMsg: "NO Product found"
                }
            });
        }

    } else {
        return res.status(200).send({
            success: false,
            details: [],
            message: "Type is require",
            errorNode: {
                errorCode: 1,
                errorMsg: "Type is require"
            }
        });
    }
}

exports.emegazineProductDetails1 = async (req, res) => {
    const productId = req.body.productId
    if (productId && productId != '' && productId != null) {
        let emegazineProduct = await models.Product.findAll({
            attributes: ["id", "title", "short_description", "published_datetime", "magazine_preview",'magazine_full'],
            where: { id: productId }
        })
        let emegazineProductDetails = [];
        if (emegazineProduct.length > 0) {
            for (var j = 0; j < emegazineProduct.length; j++) {
                emegazineProductDetails.push({
                    "id": emegazineProduct[j].id,
                    "title": emegazineProduct[j].title,
                    // "short_description": emegazineProduct[j].short_description,
                    // "published_datetime": emegazineProduct[j].published_datetime,
                    // "thumbnail_landscape": (emegazineProduct[j].thumbnail_landscape != '' && emegazineProduct[j].thumbnail_landscape != null) ? req.app.locals.baseurl + 'admin/product/' + emegazineProduct[j].thumbnail_landscape : req.app.locals.baseurl + 'admin/product/no_image.jpg',
                    "magazine_preview" : (emegazineProduct[j].magazine_preview != '' && emegazineProduct[j].magazine_preview != null) ? req.app.locals.baseurl + 'admin/contents/product/pdf/' + emegazineProduct[j].magazine_preview : req.app.locals.baseurl + 'admin/contents/product/pdf/no_image.pdf',
                    "magazine_full" : (emegazineProduct[j].magazine_full != '' && emegazineProduct[j].magazine_full != null) ? req.app.locals.baseurl + 'admin/contents/product/pdf/' + emegazineProduct[j].magazine_full : req.app.locals.baseurl + 'admin/contents/product/pdf/no_image.pdf',
             });
            }
        }
        if (emegazineProductDetails.length > 0) {
            return res.status(200).send({
                success: true,
                details: emegazineProductDetails,
                errorNode: {
                    errorCode: 0,
                    errorMsg: "No Error"
                }
            });
        } else {
            return res.status(200).send({
                data: {
                    success: false,
                    details: [],
                    message: "Product not found"
                },
                errorNode: {
                    errorCode: 1,
                    errorMsg: "Product not found"
                }
            });
        }

    }
}

exports.newsProductList = async (req, res) => {
    const { Type } = req.body
    if (Type && Type != '' && Type != null) {
        let newsProduct = await models.Product.findAll({
            attributes: ["id", "title", "category_id", "type", "published_datetime", "subscription", "thumbnail_portrait"],
            where: { type: Type, status: 'published' },
            order: [['id', 'DESC']]
        })
        let leastNewsProductList = [];
        if (newsProduct.length > 0) {
            for (var j = 0; j < newsProduct.length; j++) {
                leastNewsProductList.push({
                    "id": newsProduct[j].id,
                    "title": newsProduct[j].title,
                    "type": newsProduct[j].type,
                    "content": newsProduct[j].content,
                    "subscription": newsProduct[j].subscription,
                    "published_datetime": newsProduct[j].published_datetime,
                    "thumbnail_portrait": (newsProduct[j].thumbnail_portrait != '' && newsProduct[j].thumbnail_portrait != null) ? req.app.locals.baseurl + 'admin/contents/product/' + newsProduct[j].thumbnail_portrait : req.app.locals.baseurl + 'admin/contents/product/no_image.jpg',
                });
            }
        }

        // let likeNewsProduct = await models.Product.findAll({
        //     attributes: ["id", "title", "category_id", "type", "published_datetime", "subscription", "thumbnail_portrait"],
        //     where: { type: Type, status: 'published' },
        //     order: [['likeCount', 'DESC']]
        // })
        // let likeNewsProductList = [];
        // if (likeNewsProduct.length > 0) {
        //     for (var j = 0; j < likeNewsProduct.length; j++) {
        //         likeNewsProductList.push({
        //             "id": likeNewsProduct[j].id,
        //             "title": likeNewsProduct[j].title,
        //             "type": likeNewsProduct[j].type,
        //             "subscription": likeNewsProduct[j].subscription,
        //             "published_datetime": likeNewsProduct[j].published_datetime,
        //             "thumbnail_portrait": (likeNewsProduct[j].thumbnail_portrait != '' && likeNewsProduct[j].thumbnail_portrait != null) ? req.app.locals.baseurl + 'admin/product/' + likeNewsProduct[j].thumbnail_portrait : req.app.locals.baseurl + 'admin/product/no_image.jpg',
        //         });
        //     }
        // }

        if (leastNewsProductList.length > 0) {
            return res.status(200).send({
                success: true,
                leastNewsProductList: leastNewsProductList,
                // likeNewsProductList:likeNewsProductList,
                errorNode: {
                    errorCode: 0,
                    errorMsg: "No Error"
                }
            });
        } else {
            return res.status(200).send({
                success: false,
                list: [],
                message: "NO Product found",
                errorNode: {
                    errorCode: 1,
                    errorMsg: "NO Product found"
                }
            });
        }
    } else {
        return res.status(200).send({
            success: false,
            list: [],
            message: "Type is require",
            errorNode: {
                errorCode: 1,
                errorMsg: "Type is require"
            }
        });
    }
}

exports.newsProductDetails = async (req, res) => {
    const productId = req.body.productId
    const customerId=req.body.customerId || null
    if (productId && productId != '' && productId != null) {
        let newsProduct = await models.Product.findAll({
            attributes: ["id", "title", "content", "short_description","tags", "published_datetime", "thumbnail_landscape"],
            where: { id: productId }
        })
        // const existingProduct = await models.Mycollection.findOne({
        //     where: { customerId: customerId, productId: productId }
        // });

        let relatedProductList=[];
        let newsProductDetails = [];

        // if (existingProduct) {
            if (newsProduct) {
                for (var j = 0; j < newsProduct.length; j++) {
                    let relatedProduct = await models.Product.findAll({
                        attributes: ["id", "title", "thumbnail_portrait", "category_id"],
                        where: {
                            id:{[Op.ne]:newsProduct[j].id},
                             type: "news"
                             },
                        order: [['id', 'DESC']],
                    })
                    for (var i = 0; i < relatedProduct.length; i++) {
                        relatedProductList.push({
                            "id": relatedProduct[i].id,
                            "title": relatedProduct[i].title,
                            "thumbnail_portrait": (relatedProduct[i].thumbnail_portrait != '' && relatedProduct[i].thumbnail_portrait != null) ? req.app.locals.baseurl + 'admin/contents/product/' + relatedProduct[i].thumbnail_portrait : req.app.locals.baseurl + 'admin/contents/product/no_image.jpg',
                            
                        });
                    }
                    let myCollectionData = false
                    if (customerId && customerId != null) {
                        const existingProduct = await models.Mycollection.findOne({
                            where: { customerId: customerId, productId: productId }
                        });

                        console.log(existingProduct);
                        if (existingProduct) {
                            myCollectionData = true
                        }
                    }
                    newsProductDetails.push({
                        "id": newsProduct[j].id,
                        "title": newsProduct[j].title,
                        "short_description": newsProduct[j].short_description,
                        "content": newsProduct[j].content,
                        "tags": newsProduct[j].tags,
                        "published_datetime": newsProduct[j].published_datetime,
                        "thumbnail_landscape": (newsProduct[j].thumbnail_landscape != '' && newsProduct[j].thumbnail_landscape != null) ? req.app.locals.baseurl + 'admin/contents/product/' + newsProduct[j].thumbnail_landscape : req.app.locals.baseurl + 'admin/contents/product/no_image.jpg',
                        "isMyCollection": myCollectionData
                    });
                }
            }
        // }else{
        //     if (newsProduct.length > 0) {
        //         for (var j = 0; j < newsProduct.length; j++) {
        //             let relatedProduct = await models.Product.findAll({
        //                 attributes: ["id", "title", "thumbnail_portrait", "category_id"],
        //                 where: {
        //                     id:{[Op.ne]:newsProduct[j].id},
        //                      type: newsProduct[j].type
        //                      },
        //                 order: [['id', 'DESC']],
        //             })
        //             for (var i = 0; i < relatedProduct.length; i++) {
        //                 relatedProductList.push({
        //                     "id": relatedProduct[i].id,
        //                     "title": relatedProduct[i].title,
        //                     "thumbnail_portrait": (relatedProduct[i].thumbnail_portrait != '' && relatedProduct[i].thumbnail_portrait != null) ? req.app.locals.baseurl + 'admin/contents/product/' + relatedProduct[i].thumbnail_portrait : req.app.locals.baseurl + 'admin/contents/product/no_image.jpg',
                            
        //                 });
        //             }

        //             newsProductDetails.push({
        //                 "id": newsProduct[j].id,
        //                 "title": newsProduct[j].title,
        //                 "short_description": newsProduct[j].short_description,
        //                 "content": newsProduct[j].content,
        //                 "published_datetime": newsProduct[j].published_datetime,
        //                 "thumbnail_landscape": (newsProduct[j].thumbnail_landscape != '' && newsProduct[j].thumbnail_landscape != null) ? req.app.locals.baseurl + 'admin/product/' + newsProduct[j].thumbnail_landscape : req.app.locals.baseurl + 'admin/product/no_image.jpg',
        //                 "isMyCollection":"true"
        //             });
        //         }
        //     }
        // }
        
        if (newsProductDetails.length > 0) {
            return res.status(200).send({
                data: {
                    success: true,
                    details: newsProductDetails,
                    relatedProductList:relatedProductList
                },
                errorNode: {
                    errorCode: 0,
                    errorMsg: "No Error"
                }
            });
        } else {
            return res.status(200).send({
                data: {
                    success: false,
                    details: [],
                    message: "Product not found"
                },
                errorNode: {
                    errorCode: 1,
                    errorMsg: "Product not found"
                }
            });
        }

    }
}


exports.audioSpeech = async (req, res) => {
    const productId = req.body.productId
    if (productId && productId != '' && productId != null) {
        let productSpeech = await models.Product.findOne({
            attributes: ["id", "content",],
            where: { id: productId }
        })
        let speechArray = [];

        gtts.save("public/admin/contents/product/speech/audio.mp3", productSpeech.content, function () {

            let filePath = req.app.locals.baseurl + 'admin/contents/product/speech/audio.mp3'
            speechArray.push({
                filePath
            })
            if (speechArray.length > 0) {
                return res.status(200).send({
                    data: {
                        success: true,
                        speechArray: speechArray
                    },
                    errorNode: {
                        errorCode: 0,
                        errorMsg: "No Error"
                    }
                });
            } else {
                return res.status(200).send({
                    data: {
                        success: false,
                        speechArray: [],
                        message: "Product not found"
                    },
                    errorNode: {
                        errorCode: 1,
                        errorMsg: "Product not found"
                    }
                });
            }
        })
    }
}


// const axios = require('axios');
// const  createFlipBook  = require('page-flip');
// const createFlipBook = require('page-flip');



exports.emegazineProductDetails = async (req, res) => {
    const productId = req.body.productId;

    if (productId && productId !== '' && productId !== null) {
        let emegazineProduct = await models.Product.findAll({
            attributes: ["id", "title", "short_description", "published_datetime", "magazine_preview", "magazine_full"],
            where: { id: productId },
        });

        let emegazineProductDetails = [];

        if (emegazineProduct.length > 0) {
            for (var j = 0; j < emegazineProduct.length; j++) {
                // let pdfUrl=(emegazineProduct[j].magazine_full != '' && emegazineProduct[j].magazine_full != null) ? req.app.locals.baseurl + 'admin/contents/product/pdf/' + emegazineProduct[j].magazine_full : req.app.locals.baseurl + 'admin/contents/product/pdf/no_image.pdf'
                // console.log("1111111111111111111");
                // console.log(pdfUrl);
                 let htmlLink="http://flowpaper.com/flipbook/https://aseema.tezcommerce.com:3325/admin/contents/product/pdf/1696507350512.pdf"
            //     let flowpaperUrl = 'http://flowpaper.com/flipbook/';

            //    let htmlLink = `<a href="${flowpaperUrl}${pdfUrl}"</a>`;
                 
                
                // const flipbookUrl = await convertToFlipbook( req.app.locals.baseurl + 'admin/contents/product/pdf/' + emegazineProduct[j].magazine_full);
                // console.log("2222222222222222222222222");
                // console.log(flipbookUrl);
                emegazineProductDetails.push({
                    "id": emegazineProduct[j].id,
                    "title": emegazineProduct[j].title,
                    // "short_description": emegazineProduct[j].short_description,
                    // "published_datetime": emegazineProduct[j].published_datetime,
                    // "thumbnail_landscape": (emegazineProduct[j].thumbnail_landscape !== '' && emegazineProduct[j].thumbnail_landscape !== null) ? req.app.locals.baseurl + 'admin/product/' + emegazineProduct[j].thumbnail_landscape : req.app.locals.baseurl + 'admin/product/no_image.jpg',
                    "magazine_preview": (emegazineProduct[j].magazine_preview !== '' && emegazineProduct[j].magazine_preview !== null) ? req.app.locals.baseurl + 'admin/contents/product/pdf/' + emegazineProduct[j].magazine_preview : req.app.locals.baseurl + 'admin/contents/product/pdf/no_image.pdf',
                    "magazine_full": htmlLink, 
                });
            }
        }

        if (emegazineProductDetails.length > 0) {
            return res.status(200).send({
                success: true,
                details: emegazineProductDetails,
                errorNode: {
                    errorCode: 0,
                    errorMsg: "No Error",
                },
            });
        } else {
            return res.status(200).send({
                data: {
                    success: false,
                    details: [],
                    message: "Product not found",
                },
                errorNode: {
                    errorCode: 1,
                    errorMsg: "Product not found",
                },
            });
        }
    }
};

// Function to convert PDF URL to flipbook URL
// async function convertToFlipbook(pdfUrl) {
//     console.log("++++++++++++++++++++++++++++");
//     console.log(pdfUrl);
//     try {
//         const response = await axios.get(pdfUrl, { responseType: 'arraybuffer' });
//         console.log("11111111111111111111111111111");
//         console.log(response.data);
//         const pdfBuffer = response.data;
//         console.log("###################################");
//         const pageFlip = new PageFlip( {
//             width: 400, // required parameter - base page width
//             height: 600, // required parameter - base page height
//         });

//         // const flipBook = createFlipBook;
//         console.log("333333333333333333333");
//         console.log(flipBook);
//         const flipbookUrl = await flipBook.generate();
//         console.log("44444444444444444444");
//         console.log(flipbookUrl);
//         return flipbookUrl;
//     } catch (error) {
//         console.error('Error converting PDF to flipbook:', error.message);
//     }
// }



exports.searchProduct = async (req, res) => {
    const searchText = req.body.searchText || '';
    if (searchText != undefined && searchText != null && searchText != '') {
        let product = await models.Product.findAll({
            attributes: ["id", "title","type", "published_datetime", "thumbnail_landscape", "thumbnail_portrait"],
            where: {
                [Op.or]: [
                    { title: { [Op.like]: `%${searchText}%` } },
                    { type: { [Op.like]: `%${searchText}%` } },
                ]
            },
            order: [['id', 'DESC']]
        })
        let searchProductList = [];
        if (product.length > 0) {
            for (var j = 0; j < product.length; j++) {
                searchProductList.push({
                    "id": product[j].id,
                    "title": product[j].title,
                    "type" : product[j].type,
                    "published_datetime": product[j].published_datetime,
                    "thumbnail_portrait": (product[j].thumbnail_portrait != '' && product[j].thumbnail_portrait != null) ? req.app.locals.baseurl + 'admin/contents/product/' + product[j].thumbnail_portrait : req.app.locals.baseurl + 'admin/contents/product/no_image.jpg',
                    "thumbnail_landscape": (product[j].thumbnail_landscape != '' && product[j].thumbnail_landscape != null) ? req.app.locals.baseurl + 'admin/contents/product/' + product[j].thumbnail_landscape : req.app.locals.baseurl + 'admin/contents/product/no_image.jpg',
                })
            }
        }
        if (searchProductList.length > 0) {
            return res.status(200).send({
                data: {
                    success: true,
                    searchProductList: searchProductList
                },
                errorNode: {
                    errorCode: 0,
                    errorMsg: "No Error"
                }
            });
        } else {
            return res.status(200).send({
                data: {
                    success: false,
                    details: [],
                    message: "Product not found"
                },
                errorNode: {
                    errorCode: 1,
                    errorMsg: "Product not found"
                }
            });
        }
    }
}
