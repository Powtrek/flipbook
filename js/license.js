"use strict";
jQuery(document).ready(function ($) {
  // Initial AJAX parameters setup
  const ajaxParams = {
    type: "POST",
    dataType: "text",
    error: function (xhr, status, error) {
      showError("Error occurred: " + (xhr.responseText || error));
    },
  };

  if (!ajaxParams.url) {
    ajaxParams.url = "https://check.real3dflipbook.net/verify.php";
  }

  // Loop through each license form setup
  $(".addon-license-form").each(function () {
    const $form = $(this);
    const formId = $form.attr("id");
    const itemKey = formId.replace("form-", "");
    const $input = $("#" + itemKey + "_license");
    const $activate = $("#activate-" + itemKey);
    const $deactivate = $("#deactivate-" + itemKey);

    // Enable or disable the activate button based on input
    $input.on("input", function () {
      $activate.prop("disabled", $input.val().trim() === "");
    });

    // Activation button handler
    $activate.click(function () {
      if (isValidEnvatoCode($input.val())) {
        emapi($input.val(), itemKey, false); // Pass 'false' for activation
        $activate.prop("disabled", true);
      } else {
        showError("Invalid purchase code");
      }
    });

    // Deactivation button handler
    $deactivate.click(function () {
      if (isValidEnvatoCode($input.val())) {
        emapi($input.val(), itemKey, true); // Pass 'true' for deactivation
        $deactivate.prop("disabled", true);
      } else {
        save("", itemKey);
        showError("Invalid purchase code");
      }
    });

    // Set initial state of buttons
    updateButtonState();

    function updateButtonState() {
      const inputVal = $input.val().trim();
      const isDeactivateVisible = $deactivate.is(":visible");
      $activate.prop("disabled", inputVal === "");
      $deactivate.toggle(!!inputVal);
      $activate.toggle(!inputVal);
      $input.prop("disabled", isDeactivateVisible);
    }
  });

  function activated(itemKey) {
    const input = document.getElementById(itemKey + "_license");
    const activate = document.getElementById("activate-" + itemKey);
    const deactivate = document.getElementById("deactivate-" + itemKey);

    activate.style.display = "none";
    deactivate.style.display = "inline-block";
    input.disabled = true; // Disabling the input when activated
  }

  function deactivated(itemKey) {
    const input = document.getElementById(itemKey + "_license");
    const activate = document.getElementById("activate-" + itemKey);
    const deactivate = document.getElementById("deactivate-" + itemKey);

    activate.style.display = "inline-block";
    deactivate.style.display = "none";
    input.disabled = false; // Enabling the input when deactivated
    input.value = ""; // Clearing the value
  }

  // Validate the format of the Envato purchase code
  function isValidEnvatoCode(code) {
    return /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(
      code
    );
  }

  function emapi(key, item, deactivate) {
    ajaxParams["data"] = {};
    ajaxParams["data"]["purchaseCode"] = key;
    ajaxParams["data"]["domain"] = window.location.hostname;
    if (item) ajaxParams["data"]["item"] = item;
    if (deactivate) ajaxParams["data"]["deactivate"] = deactivate;
    ajaxParams["success"] = function (response, text, xhr) {
      if (deactivate) {
        key = "";
        save(key, item);
      }
      if (!response.includes("ctiv")) {
        showError("Error occurred: " + response);
        const input = document.getElementById(item + "_license");
        const activate = document.getElementById("activate-" + item);
        input.disabled = false;
        input.value = "";
        activate.disabled = true;
      } else {
        showSuccess(response);
        save(key, item);
      }
    };
    ajaxParams["error"] = function (xhr, status, error) {
      showError("Error occurred: " + xhr.responseText || error);
      const input = document.getElementById(item + "_license");
      const activate = document.getElementById("activate-" + item);

      input.disabled = false;
      input.value = "";
      activate.disabled = true;
    };
    $.ajax(ajaxParams);
  }

  async function save(val, itemKey) {
    const url = "admin-ajax.php?page=real3d_flipbook_admin";
    const formData = new FormData();
    formData.append("action", "r3d_save_key");
    formData.append("key", val);
    formData.append("name", itemKey);
    formData.append("security", window.r3d_ajax.nonce);

    try {
      const response = await fetch(url, {
        method: "POST",
        body: formData,
      });
      const textResponse = await response.text();

      if (val) {
        activated(itemKey);
      } else {
        deactivated(itemKey);
      }
    } catch (error) {
      deactivated(itemKey);
    }
  }

  // Display success messages
  function showSuccess(message) {
    showAlert(message, "success");
  }

  // Display error messages
  function showError(message) {
    showAlert(message, "error");
  }

  // General alert display function
  function showAlert(message, type) {
    var alertClass = "notice";
    if (type === "success") {
      alertClass += " notice-success";
    } else {
      alertClass += " notice-error";
    }
    var html =
      '<div class="' +
      alertClass +
      ' is-dismissible"><p>' +
      message +
      "</p></div>";
    $("#wpbody-content").prepend(html);
    setTimeout(function () {
      $("." + alertClass).fadeOut("fast", function () {
        $(this).remove();
      });
    }, 5000);
  }
});
