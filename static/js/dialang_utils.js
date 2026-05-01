(function ($) {

    dialang.utils = dialang.utils || {};

    dialang.utils.setupKeyboard = function () {

        $.get('/content/keyboards/' + dialang.session.tl + '.html', function (data) {

            $('#keyboard').html(data);

            $(document).ready(function () {

                $('#keyboard-dialog').dialog({
                    dialogClass: "no-close",
                    resizable: false,
                    width: 'auto',
                    autoOpen: false
                });

                $('#keyboard button').click(function (e) {

                    var v = dialang.lastFocused.value;
                    var pre = v.substring(0, dialang.lastSelectionStart);
                    var post = v.substring(dialang.lastSelectionEnd);
                    var c = this.getAttribute('data-char');
                    dialang.lastFocused.value = pre + c + post;
                    dialang.lastSelectionStart = dialang.lastFocused.selectionStart;
                    dialang.lastSelectionEnd = dialang.lastFocused.selectionEnd;
                    $(dialang.lastFocused).focus().keyup();
                    return false;
                });

                $('#keyboard-button').click(function (e) {

                    if (dialang.session.keyboardDisplayed) {
                        $('#keyboard-dialog').dialog('close');
                        dialang.session.keyboardDisplayed = false;
                    } else {
                        $('#keyboard-dialog').dialog('open');
                        dialang.session.keyboardDisplayed = true;
                    }
                });
            });
        });
    };

    dialang.utils.configureScoredBasket = function (basket) {

        // Map the basket onto the basket id for lookup later.
        dialang.session.baskets[basket.id] = basket;

        basket.items.forEach(function (item) {

            dialang.session.items.push(item);
            dialang.session.itemToBasketMap[item.id] = basket.id;

            if (item.type === 'mcq' || item.type === 'gapdrop') {

                // Set the response text on this item
                item.answers.forEach(function (answer) {

                    if (answer.correct) {
                        item.correctAnswer = answer.text;
                    }
                    if (answer.id === item.responseId) {
                        item.responseText = answer.text;
                    }
                });
            } else if (item.type === 'gaptext' || item.type === 'shortanswer') {

                var answersMarkup = '';
                item.answers.forEach(function (answer) {
                    answersMarkup += answer.text + '<br />';
                });
                item.correctAnswer = answersMarkup;
            }

            var subskill = item.subskill;

            if (!dialang.session.subskills[subskill]) {
                // No subskill keyed yet, ensure that one is.
                dialang.session.subskills[subskill] = {'correct':[],'incorrect':[]};
            }

            if (item.correct) {
                dialang.session.subskills[subskill].correct.push(item);
            } else {
                dialang.session.subskills[subskill].incorrect.push(item);
            }

        }); //items

        if (!dialang.scoredBaskets) {
            dialang.scoredBaskets = [];
        }

        dialang.scoredBaskets.push(basket);
    }
}) (jQuery);
