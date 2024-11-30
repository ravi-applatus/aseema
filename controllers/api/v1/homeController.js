const models = require('../../../models');
const Sequelize = require('sequelize');
const Op = Sequelize.Op
const fs = require("fs");

exports.bannerList = async function (req, res) {
    const { bannerType } = req.body
    if (bannerType && bannerType != '' && bannerType != null) {
        let bannerList = await models.Banner.findAll({ where: { status: 'y', bannerGroup: bannerType }, order: [['sequence', 'ASC']] })
        let list = [];
        if (bannerList.length > 0) {
            for (var j = 0; j < bannerList.length; j++) {
                list.push({
                    "id": bannerList[j].id,
                    "title": bannerList[j].title,
                    "contentType": bannerList[j].content_type,
                    "content": (bannerList[j].content != '' && bannerList[j].content != null) ? req.app.locals.baseurl + 'admin/banner/' + bannerList[j].content : req.app.locals.baseurl + 'admin/banner/no_image.jpg',
                    "url": bannerList[j].link_url
                });
            }
        }
        if (list.length > 0) {
            return res.status(200).send({
                data: {
                    success: true,
                    details: list
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
                    message: "NO banner found"
                },
                errorNode: {
                    errorCode: 1,
                    errorMsg: "NO banner found"
                }
            });
        }
    } else {
        return res.status(200).send({
            data: {
                success: false,
                details: [],
                message: "Banner Type is require"
            },
            errorNode: {
                errorCode: 1,
                errorMsg: "Banner Type require"
            }
        });
    }
};

exports.homeProductList = async function (req, res) {
    const { type } = req.body
    if (type && type != '' && type != null) {
        let productList = await models.Product.findAll({
            where: {type: type },
            order: [['published_datetime', 'DESC']]
        })
        let list = [];
        if (productList.length > 0) {
            for (var j = 0; j < productList.length; j++) {
                list.push({
                    "id": productList[j].id,
                    "title": productList[j].title,
                    "subscription": productList[j].subscription,
                    "thumbnail_portrait": (productList[j].thumbnail_portrait != '' && productList[j].thumbnail_portrait != null) ? req.app.locals.baseurl + 'admin/contents/product/' + productList[j].thumbnail_portrait : req.app.locals.baseurl + 'admin/contents/product/no_image.jpg',
                });
            }
        }
        if (list.length > 0) {
            return res.status(200).send({
                success: true,
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
            message: "Type is require",
            errorNode: {
                errorCode: 1,
                errorMsg: "Type require"
            }
        });
    }
}




exports.customerProfile = async (req, res) => {
    const { customerId } = req.body;
    if (customerId && customerId != '') {
        let customerList = await models.Customers.findOne({ attributes: { exclude: ["createdAt", "updatedAt"] }, where: { id: customerId } });

        if (customerList) {
            let list = {
                id: customerList.id,
                firstName: customerList.firstName,
                lastName: customerList.lastName,
                fullName: customerList.fullName,
                email: customerList.email,
                mobile: customerList.mobile,
                image: (customerList.image != '' && customerList.image != null) ? req.app.locals.baseurl + 'admin/customers/' + customerList.image : req.app.locals.baseurl + 'admin/customers/no_image.jpg',
            }

            return res.status(200).send({
                success: true,
                details: list,
                errorNode: {
                    errorCode: 0,
                    errorMsg: "No Error"
                }
            });
        } else {
            return res.status(200).send({
                success: true,
                details: "",
                message: "Customer Dose'nt exist",
                errorNode: {
                    errorCode: 0,
                    errorMsg: "Customer Dose'nt exist"
                }
            });
        }
    } else {
        res.status(200).send({
            success: false,
            message: 'User Id required'
        });
    }
}

exports.customerProfileUpdate = async (req, res) => {
    const customerId = req.body.customerId;
    const customerFirstName = req.body.customerFirstName;
    const customerLastName = req.body.customerLastName;
    const customerEmail = req.body.customerEmail;
    if (customerId && customerId != null && customerId != '') {
        // if (customerFirstName && customerFirstName != null && customerFirstName != '' && customerLastName && customerLastName != null && customerEmail && customerEmail != null && customerEmail != '') {
        try {
            const customerDetails = await models.Customers.findOne({ attributes: ['id', 'firstName'], where: { id: customerId } });
            if (customerDetails) {
                await models.Customers.update({
                    firstName: customerFirstName,
                    lastName: customerLastName,
                    email: customerEmail
                }, { where: { id: customerId } }).then(async function (updateCustomer) {
                    if (updateCustomer) {
                        return res.status(200).send({
                            success: true,
                            message: "Successfully updated",
                            errorNode: {
                                errorCode: 0,
                                errorMsg: 'No Error'
                            }
                        });
                    }
                });
            } else {
                return res.status(400).send({
                    success: false,
                    message: 'Customer not found',
                    errorNode: {
                        errorCode: 1,
                        errorMsg: 'Customer not found'
                    }
                });
            }
        } catch (error) {
            return res.status(500).send({
                success: false,
                message: "Something went wrong",
                errorNode: {
                    errorCode: 1,
                    errorMsg: error
                }
            });
        }
        // } else {
        //     return res.status(400).send({
        //         success: false,
        //         message: 'Customer Name and Email is required',
        //         errorNode: {
        //             errorCode: 1,
        //             errorMsg: 'Customer Name and Email is required'
        //         }
        //     });
        // }

    } else {
        return res.status(400).send({
            success: false, message: 'Customer id is required',
            errorNode: {
                errorCode: 1,
                errorMsg: 'Customer id is required'
            }
        });
    }
};

exports.profileImageUpdate = async (req, res) => {
    const customerId = req.body.customerId || null
    const imageExt = req.body.imageExt || null
    const image = req.body.image || null
    if (customerId && customerId != null && customerId != '') {
        if (image && image != null && image != '' && imageExt && imageExt != null && imageExt != '') {
            try {
                const customerDetails = await models.Customers.findOne({ attributes: ['id', 'firstName'], where: { id: customerId } });
                if (customerDetails) {
                    const dir = "./public/admin/customers/";
                    if (!fs.existsSync(dir)) {
                        fs.mkdirSync(dir);
                    }

                    const imageTitle = Date.now();
                    const path = "./public/admin/customers/" + imageTitle + "." + imageExt;
                    const normalImage = imageTitle + "." + imageExt;
                    const imgdata = image;
                    const base64Data = imgdata.replace(/^data:([A-Za-z-+/]+);base64,/, "");
                    fs.writeFileSync(path, base64Data, { encoding: 'base64' });
                    await models.Customers.update({ image: normalImage }, { where: { id: customerId } });

                    return res.status(200).send({
                        success: true,
                        message: "Successfully updated",
                        imgdata: req.app.locals.baseurl + 'admin/customers/' + normalImage,
                        errorNode: {
                            errorCode: 0,
                            errorMsg: 'No Error'
                        }
                    });

                } else {
                    return res.status(400).send({
                        success: false,
                        message: 'Customer not found',
                        errorNode: {
                            errorCode: 1,
                            errorMsg: 'Customer id is required'
                        }
                    });
                }
            } catch (error) {
                return res.status(500).send({
                    success: false,
                    message: "Something went wrong",
                    errorNode: {
                        errorCode: 1,
                        errorMsg: error
                    }
                });
            }
        } else {
            return res.status(400).send({
                success: false,
                message: 'Image and imageExt is required',
                errorNode: {
                    errorCode: 1,
                    errorMsg: 'Image and imageExt id is required'
                }
            });
        }

    } else {
        return res.status(400).send({
            success: false, message: 'Customer id is required',
            errorNode: {
                errorCode: 1,
                errorMsg: 'Customer id is required'
            }
        });
    }
};