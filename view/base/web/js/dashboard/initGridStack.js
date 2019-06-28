/**
 * Mageplaza
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Mageplaza.com license that is
 * available through the world-wide-web at this URL:
 * https://www.mageplaza.com/LICENSE.txt
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade this extension to newer
 * version in the future.
 *
 * @category    Mageplaza
 * @package     Mageplaza_Reports
 * @copyright   Copyright (c) Mageplaza (https://www.mageplaza.com/)
 * @license     https://www.mageplaza.com/LICENSE.txt
 */

define([
    'jquery',
    'gridstack',
    'gridstackJqueryUi',
    'touchPunch'
], function ($) {
    'use strict';

    $.widget('mageplaza.initGridStack', {
        options: {
            url: '',
            url_loadcard: '',
            gridWidget: []
        },
        _create: function () {
            this.initGrid();
            this.changeCardPositionObs();
            this.toggleCardTable();
            this.toggleCardVisible();
        },
        toggleCardTable: function () {
            var cardsTableEl = $('.mp-ar-card.admin__action-dropdown-wrap.admin__data-grid-action-columns');
            $('button#mp-ar-card').on('click', function () {
                if (cardsTableEl.hasClass('_active')) {
                    cardsTableEl.removeClass('_active');
                } else {
                    cardsTableEl.addClass('_active');
                }
            });
            $('body').on('click', function (e) {
                if (!$(e.target).parents().hasClass('mp-ar-card')) {
                    cardsTableEl.removeClass('_active');
                }
            });
        },
        changeCardPositionObs: function () {
            var self = this;
            var gridStackEl = $('.grid-stack');

            gridStackEl.on('change', function (event, items) {
                var data = {};
                if (items === undefined) {
                    return;
                }
                for (var item of items) {
                    data[item.id] = {
                        'x': item.x,
                        'y': item.y,
                        'width': item.width,
                        'height': item.height
                    }
                }

                self.saveCardPosition(data);
            });
        },
        toggleCardVisible: function () {
            var self = this;
            var url_load_card = self.options.url_loadcard;
            $('.admin__action-dropdown-menu-content .admin__control-checkbox').each(function () {
                $(this).change(function () {
                    var cartId = $(this).attr('data-cart-id'),
                        cardEl = $('#' + cartId);
                    if (cardEl.length < 1) {
                        var card = this;
                        $.ajax({
                            url: url_load_card,
                            data: {id: cartId},
                            success: function (result) {
                                var title = result.title
                                    ? '<div class="dashboard-item-title">' + result.title + '</div>' : '';
                                var detail = result.showDetail
                                    ? '<div class="view-detail">' +
                                    '<a href="' + result.detaiUrl + '" target="_blank">' + result.viewDetail + '</a>' +
                                    '</div>'
                                    : '';
                                var rate = '';
                                if (result.rate !== '' && result.isCompare) {
                                    var percent = result.rate > 0 ? 'up-rate mp-green'
                                        : result.rate < 0 ? 'down-rate mp-red' : '';
                                    rate = '<div class="chart-rate ' + percent + '">' + Math.abs(result.rate) + '% </div>';
                                }
                                var totalLabel = '';
                                if (result.total !== '') {
                                    totalLabel = '<div class="dashboard-sales-value">' + result.total + rate + '</div>';
                                }

                                var cardhtml = '<div id="' + result.id + '"'
                                    + ' class="hide" data-gs-id="' + result.id + '"'
                                    + ' data-gs-x="100" data-gs-y="100"'
                                    + ' data-gs-width="3" data-gs-height="4"'
                                    + ' data-gs-min-width="2" data-gs-min-height="3">'
                                    + ' <div class="draggable"><i class="fa fa-arrows-alt"></i></div>'
                                    + ' <div class="not-draggable">'
                                    + ' <div class="dashboard-item-container">'
                                    + ' <div class="dashboard-item-header">'
                                    + title
                                    + detail
                                    + '<div style="clear: both"></div>'
                                    + totalLabel
                                    + result.content
                                    + '</div></div></div>';
                                if (Number(result.visible) === 0 && $('#' + result.id).length < 1) {
                                    $('.grid-stack').append(cardhtml);
                                }
                                self.changeCard(card, cartId);
                                $('#' + cartId).trigger('contentUpdated');
                            }
                        });
                    } else {
                        self.changeCard(this, cartId);
                    }
                });
            });
        },
        changeCard: function (card, cartId) {
            var cardEl = $('#' + cartId);
            if (card.checked) {
                cardEl.removeClass('hide');
                this.options.grid.addWidget(cardEl);
            } else {
                this.options.grid.removeWidget(cardEl, 0);
                cardEl.attr('data-gs-y', 100).attr('data-gs-x', 0);
                cardEl.addClass('hide');
            }
            var data = {};
            data[cartId] = {
                'visible': card.checked ? 1 : 0,
                'x': cardEl.attr('data-gs-x'),
                'y': cardEl.attr('data-gs-y'),
                'width': cardEl.attr('data-gs-width'),
                'height': cardEl.attr('data-gs-height')
            };
            // save card position when show/hide card
            this.saveCardPosition(data);
        },
        saveCardPosition: function (data) {
            $.ajax({
                url: this.options.url,
                data: {items: data},
                type: 'POST'
            });
        },
        initGrid: function () {
            var gridStackEl = $('.grid-stack');

            var options = {
                alwaysShowResizeHandle: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
                cellHeight: 30,
                verticalMargin: 10,
                draggable: {handle: '.draggable', scroll: true, appendTo: 'body'},
            };
            gridStackEl.gridstack(options);
            this.options.grid = gridStackEl.data('gridstack');
        }
    });

    return $.mageplaza.initGridStack;
});
