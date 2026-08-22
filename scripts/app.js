(() => {
      "use strict";

      /* =======================================================
         CONFIGURATION
         ======================================================= */

      const BOOT_TIME = 3500;

      const diagnosticSteps = [
        {
          value: "OK",
          trigger: 8
        },
        {
          value: "OK",
          trigger: 20
        },
        {
          value: "OK",
          trigger: 34
        },
        {
          value: "028",
          trigger: 48
        },
        {
          value: "UNKNOWN",
          trigger: 61
        }
      ];

      const statusStages = [
        {
          max: 10,
          text: "VERIFYING BOOT SECTOR..."
        },
        {
          max: 22,
          text: "CHECKING MEMORY BANKS..."
        },
        {
          max: 36,
          text: "ENGAGING GEARBOX..."
        },
        {
          max: 50,
          text: "MOUNTING PROJECT REGISTRY..."
        },
        {
          max: 63,
          text: "RUNNING SANITY PROTOCOL..."
        },
        {
          max: 76,
          text: "INITIALIZING MODULE INTERFACE..."
        },
        {
          max: 88,
          text: "LINKING CORE SERVICES..."
        },
        {
          max: 96,
          text: "FINAL SYSTEM CHECK..."
        },
        {
          max: 100,
          text: "SYSTEM READY."
        }
      ];

      /* =======================================================
         DOM
         ======================================================= */

      const bootScreen =
        document.getElementById("bootScreen");

      const mainPage =
        document.getElementById("mainPage");

      const percentage =
        document.getElementById("percentage");

      const progressBar =
        document.getElementById("progressBar");

      const progressCount =
        document.getElementById("progressCount");

      const statusLine =
        document.getElementById("statusLine");

      const estimatedTime =
        document.getElementById("estimatedTime");

      const runtimeText =
        document.getElementById("runtimeText");

      const bootFooter =
        document.getElementById("bootFooter");

      const clock =
        document.getElementById("clock");

      const screenFlash =
        document.getElementById("screenFlash");

      const replayButton =
        document.getElementById("replayButton");

      const diagnosticRows =
        [...document.querySelectorAll(
          ".diagnostic-row"
        )];

      /* =======================================================
         CLOCK
         ======================================================= */

      function updateClock() {
        const now = new Date();

        const hours =
          String(now.getUTCHours()).padStart(2, "0");

        const minutes =
          String(now.getUTCMinutes()).padStart(2, "0");

        const seconds =
          String(now.getUTCSeconds()).padStart(2, "0");

        clock.textContent =
          `${hours}:${minutes}:${seconds} UTC`;
      }

      updateClock();

      setInterval(updateClock, 1000);

      /* =======================================================
         BOOT STATE
         ======================================================= */

      let animationFrame = null;

      let bootStart = null;

      let bootFinished = false;

      function resetDiagnostics() {
        diagnosticRows.forEach(
          (row, index) => {

            row.classList.remove(
              "active",
              "flash"
            );

            const value =
              row.querySelector(
                ".diagnostic-value"
              );

            value.textContent = "WAIT";

            row.dataset.done = "false";
          }
        );
      }

      function updateDiagnostics(progress) {
        diagnosticRows.forEach(
          (row, index) => {

            const step =
              diagnosticSteps[index];

            if (
              progress >= step.trigger &&
              row.dataset.done !== "true"
            ) {
              row.dataset.done = "true";

              row.classList.add(
                "active",
                "flash"
              );

              const value =
                row.querySelector(
                  ".diagnostic-value"
                );

              value.textContent =
                step.value;

              window.setTimeout(() => {
                row.classList.remove(
                  "flash"
                );
              }, 380);
            }
          }
        );
      }

      function updateStatus(progress) {
        const current =
          statusStages.find(
            (stage) =>
              progress <= stage.max
          );

        if (current) {
          statusLine.textContent =
            current.text;
        }
      }

      function calculateProgress(
        elapsed
      ) {
        const normalized =
          Math.min(
            elapsed / BOOT_TIME,
            1
          );

        /*
          A slightly irregular curve makes the loader
          feel more like a real system boot sequence.
        */

        if (normalized < 0.1) {
          return normalized / 0.1 * 8;
        }

        if (normalized < 0.25) {
          return (
            8 +
            ((normalized - 0.1) / 0.15) *
            17
          );
        }

        if (normalized < 0.48) {
          return (
            25 +
            ((normalized - 0.25) / 0.23) *
            25
          );
        }

        if (normalized < 0.7) {
          return (
            50 +
            ((normalized - 0.48) / 0.22) *
            25
          );
        }

        if (normalized < 0.9) {
          return (
            75 +
            ((normalized - 0.7) / 0.2) *
            18
          );
        }

        return (
          93 +
          ((normalized - 0.9) / 0.1) *
          7
        );
      }

      function renderProgress(value) {
        const rounded =
          Math.min(
            100,
            Math.floor(value)
          );

        percentage.textContent =
          rounded;

        progressCount.textContent =
          rounded;

        progressBar.style.width =
          `${value}%`;

        const secondsLeft =
          Math.max(
            0,
            Math.ceil(
              BOOT_TIME *
              (1 - value / 100) /
              1000
            )
          );

        estimatedTime.textContent =
          `EST. 00:${String(
            secondsLeft
          ).padStart(2, "0")}`;

        updateDiagnostics(rounded);

        updateStatus(rounded);

        if (rounded >= 63) {
          runtimeText.classList.add(
            "active"
          );
        }
      }

      /* =======================================================
         BOOT LOOP
         ======================================================= */

      function bootLoop(timestamp) {
        if (!bootStart) {
          bootStart = timestamp;
        }

        const elapsed =
          timestamp - bootStart;

        const progress =
          calculateProgress(elapsed);

        renderProgress(progress);

        if (progress >= 100) {
          finishBoot();
          return;
        }

        animationFrame =
          requestAnimationFrame(
            bootLoop
          );
      }

      /* =======================================================
         FINISH / ENTER MAIN PAGE
         ======================================================= */

      function finishBoot() {
        if (bootFinished) {
          return;
        }

        bootFinished = true;

        renderProgress(100);

        percentage.textContent = "100";

        statusLine.textContent =
          "SYSTEM READY.";

        estimatedTime.textContent =
          "READY";

        runtimeText.textContent =
          "SYSTEM RUNTIME INITIALIZED.";

        bootFooter.textContent =
          "// SKITECH OS READY. ENTERING CORE. //";

        diagnosticRows.forEach(
          (row) => {
            row.classList.add("active");
          }
        );

        window.setTimeout(() => {
          screenFlash.classList.add(
            "flash"
          );
        }, 350);

        window.setTimeout(() => {
          bootScreen.classList.add(
            "boot-complete"
          );

          mainPage.classList.add(
            "visible"
          );

          document.body.style.overflow =
            "auto";
        }, 650);
      }

      /* =======================================================
         START / RESTART
         ======================================================= */

      function startBoot() {
        if (animationFrame) {
          cancelAnimationFrame(
            animationFrame
          );
        }

        bootStart = null;
        bootFinished = false;

        document.body.style.overflow =
          "hidden";

        bootScreen.classList.remove(
          "boot-complete"
        );

        mainPage.classList.remove(
          "visible"
        );

        screenFlash.classList.remove(
          "flash"
        );

        resetDiagnostics();

        runtimeText.classList.remove(
          "active"
        );

        runtimeText.textContent =
          "INITIALIZING SYSTEM RUNTIME...";

        bootFooter.textContent =
          "// STAND BY. INITIALIZING INTERFACE. //";

        percentage.textContent = "0";

        progressCount.textContent = "0";

        progressBar.style.width = "0%";

        statusLine.textContent =
          "BOOT SECTOR INITIALIZATION...";

        estimatedTime.textContent =
          "EST. 00:04";

        animationFrame =
          requestAnimationFrame(
            bootLoop
          );
      }

      replayButton.addEventListener(
        "click",
        () => {
          startBoot();
        }
      );

      /* =======================================================
         INITIALIZATION
         ======================================================= */

      startBoot();
    })();
