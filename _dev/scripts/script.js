(function($) {
    $.fn.getOption = function(option, params) {

        if (option == null) {
            option = this.attr('data-option');
        }

        console.log('Option ' + option + ' started...');

        try {
            if (params == null) {
                params = recordParamsData($(this)) || {};
            }
        } catch (error) {
            console.log('error getOption');
        }

        var $td = $(this).closest('td');
        if ($td.length) {
            if ($td.hasClass('td_editing')) {
                console.log('Значение в ячейке таблицы уже редактируется.');
                return false;
            }
        }

        switch (option) {

            case 'getContainerJs':
                console.log(params);
                var $btn = $(this);
        
                if(params.container && params.sources){
                    var html = $(params.sources).html();
                    var container = $btn.closest(params.container);
                    container.append(html);

                    if (params.item && params.key_text) {
                        var i = 1;

                        $(params.item, container).each(function () {
                            var current_item = $(this);
                            $(params.key_text, current_item).text(i);
                            i++;
                        });
                    }
                }
                break;

            case 'removeItem':
                var $btn = $(this);
                var target_remove = $btn.data('block-remove');

                var $form = false;
                if ($btn.closest('form').length > 0) {
                    $form = $btn.closest('form');
                }

                if ($btn.is('[data-container]')) {
                    var container = $btn.attr('data-container');
                    container = $btn.closest(container);
                }

                if ($btn.is('[data-last="true"]') && $btn.is('[data-container]')) {
                    var count = $(target_remove, container).length;
                    var target_attr = false;
                    var target_text = false;

                    if ($btn.is('[data-attr_key]')) {
                        target_attr = $btn.attr('data-attr_key');
                    }

                    if ($btn.is('[data-key_text]')) {
                        target_text = $btn.attr('data-key_text');
                    }

                    if (count > 1) {
                        $btn.closest(target_remove).remove();
                    } else {
                        $.fn.systemMessage({
                            title: 'Предупреждение!',
                            text: 'Невозможно удалить последний элемент',
                            type: 'warning'
                        });
                    }

                    if (target_attr != false) {
                        var i = 0;
                        $(target_remove, container).each(function () {
                            var current_item = $(this);
                            current_item.attr(target_attr, i);
                            i++;
                        });
                    }

                    if (target_text != false) {
                        var i = 1;
                        $(target_remove, container).each(function () {
                            var current_item = $(this);
                            $(target_text, current_item).text(i);
                            i++;
                        });
                    }

                } else {
                    $btn.closest(target_remove).remove();
                }

                // switch (target_remove) {
                //     case '.upload_item_js':
                //         if ($form != false) {
                //             var count_file = $('.upload_item_js', $form).length;
                //             if (count_file == 0) {
                //                 if ($('.upload[type="file"]', $form).length > 0) {
                //                     $('.upload[type="file"]', $form).val('');
                //                 }
                //             }
                //         }
                //         break;
                // }
                break;

            case 'updateTrackingForm': 
                try {
                    result = params.result;
                    var container = $('.form_tracking_content_js');
                    container.html(result); 

                } catch (error) {
                    console.log(error);
                }finally {
                    preloader_end();
                }
                break;
                    
            default:
                var fname = eval('$.fn.' + option);
                if ($.isFunction(fname)) {
                    console.log('delegate to ' + option + ' function...');
                    eval('$(this).' + option + '(params)');
                }
                break;
        }
    }
}(jQuery)); 


window.addEventListener('load', function() {
    $('body').on('click', '.call-js:not(.readonly):not(select):not([disabled])', function(e) {
        e.preventDefault();
        var name = $(this).attr('data-option');
        $(this).getOption(name);
    });

    $('body').on('change', 'select.change-js, .select_change_js select', function(e) {
        console.log('change .change-js select');
        e.preventDefault(); 
        var $select = $(this);
        var name = $select.data('option');
        
        if($select.closest('.select_change_js').length > 0){
            name = $select.closest('.select_change_js').data('option');
        }
        var options = recordParamsData($select) || {}; 
        var target_option = $('option:selected', $select[0]);

        $.each(target_option[0].attributes, function(){
        
            var n = this.name;
            var v = this.value;

            if (n.indexOf('data-') >= 0) {
                options[n.replace('data-', '')] = v; 
            }
        });
    
        options.val = $select.val();
        options.that = $(this);
        $select.getOption(name, options);
    });
    
    $('body').on('change', 'input[type="checkbox"].change-js', function(e) {
        console.log('.change-js checkbox');
        e.preventDefault();
        var $checkbox = $(this);

        if ($checkbox.hasClass('checkbox__field_denied-edit')) {
            if ($checkbox.hasClass('checkbox__field_lock-change')) {
                $checkbox.prop('checked', !$checkbox.prop('checked'));
                showConfirmSwal({
                    title: $checkbox.attr('data-title') ? $checkbox.attr('data-title') : 'Внимание!',
                    text: $checkbox.attr('data-text') ? $checkbox.attr('data-text') : 'Подтвердить действие ?',
                });
                scriptAfterConfirmSwal($checkbox);
                return false;
            } else {
                $checkbox.addClass('checkbox__field_lock-change');
            }
        }

        var name = $checkbox.attr('data-option');
        var options = recordParamsData($checkbox) || {}; 
        options.val = !$checkbox.is(':checked') ? 0 : 1; 
        options.that = $checkbox;
        $checkbox.getOption(name, options); 
    });

    $('body').on('change', 'input[type="radio"].change-js', function(e) {
        console.log('.change-js radio');
        e.preventDefault(); 
        var $radio = $(this);
        var name = $radio.attr('data-option');
        var options = recordParamsData($radio) || {}; 
        $radio.getOption(name, options);
    }); 

    $('body').on('change', 'input[type="text"].change-js, textarea.change-js', function(e) {
        console.log('.change-js input[type="text"]');
        e.preventDefault(); 
        var $input = $(this);
        var $form = $input.closest('form');
        var name = $input.attr('data-option');
        var options = recordParamsData($input) || {}; 
        options.val = $(this).val() || '';
        options.name = $(this).attr('name') || '';

        if($form){
            options.form = $form;
        }
    
        $input.getOption(name, options);
    }); 


    $('body').on('submit', '.form-tracking:not(.no_submit)', function(e) {
        e.preventDefault();
        console.log('form-tracking submit');
        preloader_start();
        var form = $(this);
        var query = $(this).getFormData();
        form.addClass('no_submit');

        if (form[0].disabled) {
            preloader_end();
            return false;
        }

        form[0].disabled = true;

        var formStatus = {};
        if (form.hasClass('form_check-js')) {
            formStatus = checkFormInputs(form);

            if (formStatus.countErrors) {
                preloader_end();
                $.fn.systemMessage({
                    title: formStatus.titleError,
                    text: formStatus.textError,
                    type: 'error'
                });

                setTimeout(function() {
                    form[0].disabled = false;
                    form.removeClass('no_submit');
                }, 10);
                return null;
            }
        }
        var token_api = '';

        $.ajax({
            crossOrigin: true,
            crossDomain: true,
            method: "POST",
            type: "POST",
            cache: false,
            url: baseurl,
            data: {
                request: 'login',//option,
                login: 'api_crm@hl-group.ru',
                password: 'b83cf54810c924db2ccff0a242188ad6', 
            }  
        }).done(function(msg) {
            if(isJson(msg) == true){
                var result = JSON.parse(msg);

                if(result.success == false){
                    if(result.message){
                        var message = result.message;
                        $.fn.systemMessage({
                            title: message.title || 'Ошибка!',
                            text: message.text || 'Для решения проблемы обратитесь к разработчикам.',
                            type: message.type || 'error'
                        });
                    }

                    form[0].disabled = false;
                    form.removeClass('no_submit');
                    preloader_end();
                    return false;
                }

                if(result.success == true){
                    if(result.message){
                        var message = result.message;

                        if(message.title && message.text && message.type){
                            $.fn.systemMessage({
                                title: message.title,
                                text: message.text,
                                type: message.type
                            });
                        }
                    }

                    if(result.result){
                        token_api = result.result;
                        var container = $('.container_tracking_js');
            
                        $.ajax({
                            crossOrigin: true,
                            crossDomain: true,
                            method: "POST",
                            type: "POST",
                            cache: false,
                            url: baseurl,
                            data: {
                                request: 'getClientIntransitItemByMark',
                                number_client: query.tracking,
                                token: token_api,
                                html: true, 
                            } 
                        }).done(function(msg) {
                            container.removeClass('start_js');
                            
                            if(isJson(msg) == true){
                                var result = JSON.parse(msg);

                                if(result.success == true){
                                     if(result.result){
                                        $('.form_tracking_content_js', container).html(result.result);
                                        container.removeClass('empty_js'); 
                                    }else{
                                        container.addClass('empty_js');
                                    }
                                    
                                    if(result.message){
                                        var message = result.message;
                    
                                        if(message.title && message.text && message.type){
                                            $.fn.systemMessage({
                                                title: message.title,
                                                text: message.text,
                                                type: message.type
                                            });
                                        } 
                                    }
                                }else{
                                    container.addClass('empty_js');
                                    $('.form_tracking_content_js', container).html('');

                                    // if(result.error_text){
                                    //     $.fn.systemMessage({
                                    //         title: 'Ошибка!',
                                    //         text: result.error_text || 'Для решения проблемы обратитесь к разработчикам.',
                                    //         type: 'error'
                                    //     });
                                    // }

                                    form[0].disabled = false;
                                    form.removeClass('no_submit');
                                    preloader_end();
                                    return false;
                                }
                            }
                                
                            else if (!isJson(msg)) {
                                preloader_end();
                                if (!parseInt(msg) && form.find('.mess').length) {
                                    $.fn.systemMessage({
                                        title: 'Системное сообщение',
                                        text: msg,
                                        type: 'warning'
                                    });
                                }
                            }
                        });
                    }
                }
            }

            if (!isJson(msg)) {
                preloader_end();
                if (!parseInt(msg) && form.find('.mess').length) {
                    $.fn.systemMessage({
                        title: 'Системное сообщение',
                        text: msg,
                        type: 'warning'
                    });
                }
            }
        }).fail(function(response){
            setTimeout(function() {
                form[0].disabled = false;
                form.removeClass('no_submit');
                preloader_end();
            }, 10);
        }).always(function() {
            setTimeout(function() {
                form[0].disabled = false;
                form.removeClass('no_submit');
                preloader_end();
            }, 10);
        });
    });

    $('body').on('submit', '.js-form', function(e) {
        console.log('submit .js-form');
        e.preventDefault();
        var form = $(this);

        if (form.hasClass('form_check-js') && !form.hasClass('form-two-submit-js')) {
            formStatus = checkFormInputs(form);

            if (formStatus.countErrors) {
                $.fn.systemMessage({
                    title: formStatus.titleError,
                    text: formStatus.textError,
                    type: 'error'
                });

                setTimeout(function() {
                    form[0].disabled = false;
                }, 10);
                return null;
            }
        }

        removePointInMask(form);
        var option = $('[name="submit"]', form).val();
        var query = $(this).getFormData();

        if ($('select[multiple]:not([disabled])', form).length > 0) {
            $('select[multiple]:not([disabled])', form).each(function() {
                var target_select = $(this);
                var name_select = target_select.attr('name');
                var option_value = [];

                $('option:selected', target_select).each(function() {
                    option_value.push($(this).attr('value'));
                });
                query[name_select] = option_value;
            });  
        }
        
        $(this).getOption(option, query);
    });

    /*маски ввода*/

    $('body').on('focus', '.mask-float-js, .mask-int-js', function() {
        $(this).trigger('select');
        var val_input = $(this).val();
        if (val_input == 0 || val_input == '0' || val_input == null) {
            $(this).val('');
        }
    });


    $('body').on('focus', '.mask-float-js', function() {
        $(this).initInputMask('float');
        $(this).attr('autocomplete', 'off');
    });

    $('body').on('focus', '.mask-int-js', function() {
        $(this).initInputMask();
        $(this).attr('autocomplete', 'off');
    });

    $('body').on('focus', '.mask-currency-js', function() {
        $(this).initInputMask('currency');
        $(this).attr('autocomplete', 'off');
    });

    $('body').on('focus', '.mask-phone-js', function() {
        var current_val = $(this).val();

        if(current_val[0] = '7'){
            current_val = current_val.replace('7');
            $(this).val(current_val);
        }

        Inputmask({
            mask: '+7 (999) 999-99-99',
        }).mask($(this)[0]);
    });

    $('body').on('focus', '.mask-email-js', function() {
        $(this).initInputMask("email");
    });

    $('body').on('focus', '.mask-date-js', function() {
        $(this).initInputMask('date');
        $(this).attr('autocomplete', 'off');
    });

    $('body').on('focus', '.mask-time-js', function() {
        $(this).initInputMask('time');
        $(this).attr('autocomplete', 'off');
    });

    $('body').on('focus', '.mask-datetime-js', function() {
        $(this).initInputMask('datetime');
        $(this).attr('autocomplete', 'off');
    });

    $('body').on('change', 'input[type="text"], input[type="password"], input[type="email"]', function() {
        $(this).val($.trim($(this).val()));
    });
    /*маски ввода END*/

});

function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    }));
}

function b64DecodeUnicode(str) {
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}