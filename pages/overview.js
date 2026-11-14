/* 总览：导语、怎么读、节奏图、逐月主题、开发的地基——文案来自 content/narrative.json */
(function () {
  'use strict';
  window.DSH_ARCH.pages.register('overview', {
    render: function (root, api) {
      var S = api.static;
      var M = api.data.meta;
      var bm = api.byMonth();
      var strip = Object.keys(bm).sort().map(function (k) {
        var ph = api.phaseOf(k) || { name: '', para: [] };
        return '<a href="#/phases?m=' + k + '"><span class="m">' + api.monthKey(k) + ' · ' + ph.name +
          '</span><span class="c">' + api.fill(S['总览-月卡计数'], { n: bm[k].length }) + '</span>' +
          '<span class="p">' + ph.para + '</span></a>';
      }).join('');
      var sweepText = M.sweeps.map(function (s) { return api.fill(S['总览-扫除长'], { d: s.date.slice(5), count: s.count }); }).join('、');
      root.innerHTML =
        '<section>' +
        '<p class="lede">' + api.esc(api.fill(api.site['导语'])) + '</p>' +
        '<div class="guide">' +
        '<p class="small"><i class="i k">●</i> <b>' + S['状态名'].i + '</b>——' + api.esc(api.fill(api.site['指南-现行'])) + '</p>' +
        '<p class="small"><i class="a k">◦</i> <b>' + S['状态名'].a + '</b>——' + api.esc(api.fill(api.site['指南-已封存'])) + '</p>' +
        '<p class="small"><i class="r k">◇</i> <b>' + S['状态名'].r + '</b>——' + api.esc(api.fill(api.site['指南-仅远端'])) + '</p>' +
        '</div>' +
        '</section>' +
        '<section><h2>' + api.esc(S['总览-节奏']) + '</h2>' +
        '<p class="small muted">' + api.esc(api.site['节奏图说明'] || '') +
        (M.sweeps.length ? api.esc(api.fill(S['总览-封存高峰'], { sweeps: sweepText })) : '') + '</p>' +
        '<div id="cadence" class="cadence"></div></section>' +
        '<section><h2>' + api.esc(S['总览-逐月']) + '</h2>' +
        '<p class="small muted">' + api.esc(api.site['逐月说明'] || '') + '</p>' +
        '<div class="month-strip">' + strip + '</div></section>' +
        foundationsSection(api);
      drawCadence(document.getElementById('cadence'), api);
    }
  });

  function foundationsSection(api) {
    var S = api.static;
    var titles = {};
    api.data.notes.forEach(function (x) {
      titles[x.n] = (api.zh[x.n] && api.zh[x.n].t) || x.t || x.n;
    });
    var counts = api.refCounts();
    var top = Object.keys(counts).sort(function (a, b) { return counts[b] - counts[a]; }).slice(0, 12);
    var items = top.map(function (slug) {
      return '<li><a href="#/ledger?q=' + encodeURIComponent(slug) + '"><b class="n">' + counts[slug] +
        '</b> ' + api.esc(titles[slug] || slug) + '</a></li>';
    }).join('');
    return '<section><h2>' + api.esc(S['总览-地基']) + '</h2>' +
      '<p class="small muted">' + api.esc(api.fill(api.site['地基说明'] || '')) + '</p>' +
      '<ol class="founds">' + items + '</ol></section>';
  }

  function drawCadence(fig, api) {
    var S = api.static;
    var weeks = api.data.weeks;
    var M = api.data.meta;
    var week0 = new Date(M.weekStart + 'T00:00:00Z');
    var DAY = 86400000;
    var n = weeks.length;
    var totalDays = n * 7;
    var MAXP = weeks.reduce(function (m, w) { return Math.max(m, w.p); }, 0);
    var MAXS = weeks.reduce(function (m, w) { return Math.max(m, w.s); }, 0);
    var sumP = weeks.reduce(function (a, w) { return a + w.p; }, 0);
    var sumS = weeks.reduce(function (a, w) { return a + w.s; }, 0);
    var sweepText = M.sweeps.map(function (s) { return api.fill(S['总览-扫除短'], { d: s.date.slice(5), count: s.count }); }).join('、');
    function weekIdx(iso) {
      return Math.floor((new Date(iso + 'T00:00:00Z') - week0) / DAY / 7);
    }
    /* 月份刻度：从周起点起，每个自然月 1 日所在的位置 */
    var months = [];
    var d = new Date(week0);
    var last = new Date(week0.getTime() + totalDays * DAY);
    while (d < last) {
      months.push([(d.getUTCMonth() + 1) + S['月后缀'], (d - week0) / DAY]);
      d = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 1));
    }
    function draw() {
      var w = fig.clientWidth || 600;
      var laneH = 60, laneGap = 34, topPad = 20, axisH = 20;
      var h = topPad + laneH + laneGap + laneH + axisH;
      function lane(y, key, mx, label, cls) {
        var t = '<text class="lane-label" x="0" y="' + (y - 5) + '">' + label + '</text>';
        [0.5, 1].forEach(function (f) {
          var gy = y + laneH - f * laneH;
          t += '<line class="gridline" x1="0" y1="' + gy.toFixed(1) + '" x2="' + w + '" y2="' + gy.toFixed(1) + '"></line>';
          if (f === 1) t += '<text class="gridval" x="' + (w - 2) + '" y="' + (gy - 4).toFixed(1) + '" text-anchor="end">' + mx + '</text>';
        });
        weeks.forEach(function (wk, i) {
          var v = wk[key];
          if (!v) return;
          var bw = Math.max(2, w / n - 2);
          var bh = Math.max(2, (v / mx) * laneH);
          var x = (i * w / n) + (w / n - bw) / 2;
          t += '<rect class="' + cls + '" x="' + x.toFixed(1) + '" y="' + (y + laneH - bh).toFixed(1) +
            '" width="' + bw.toFixed(1) + '" height="' + bh.toFixed(1) + '" rx="1"></rect>';
        });
        return t;
      }
      var s = '<svg viewBox="0 0 ' + w + ' ' + h + '" width="' + w + '" height="' + h +
        '" role="img" aria-label="' + api.esc(api.fill(S['总览-节奏aria'], { maxp: MAXP, sweeps: sweepText })) +
        '"><title>' + api.esc(S['总览-节奏']) + '</title>';
      s += lane(topPad, 'p', MAXP || 1, api.fill(S['总览-提出lane'], { sum: sumP, max: MAXP }), 'bar-p');
      s += lane(topPad + laneH + laneGap, 's', MAXS || 1, api.fill(S['总览-封存lane'], { sum: sumS }), 'bar-s');
      weeks.forEach(function (wk, i) {
        var dl = new Date(week0.getTime() + i * 7 * DAY);
        s += '<rect class="hit" x="' + (i * w / n).toFixed(1) + '" y="' + topPad + '" width="' + (w / n).toFixed(1) +
          '" height="' + (h - topPad - axisH) + '"><title>' + api.fill(S['总览-周提示'], { w: (dl.getUTCMonth() + 1) + '-' + dl.getUTCDate(), p: wk.p, s: wk.s }) + '</title></rect>';
      });
      M.sweeps.forEach(function (sw) {
        var idx = weekIdx(sw.date);
        if (idx < 0 || idx >= n) return;
        var label = w >= 500
          ? api.fill(S['总览-扫除长'], { d: sw.date.slice(5), count: sw.count })
          : api.fill(S['总览-扫除短'], { count: sw.count });
        var cx = ((idx + 0.5) * w / n).toFixed(1);
        var y = (topPad + laneH + laneGap + laneH - (weeks[idx].s / (MAXS || 1)) * laneH - 6).toFixed(1);
        s += '<text class="sweep" x="' + cx + '" y="' + y + '" text-anchor="middle">' + label + '</text>';
      });
      months.forEach(function (m) {
        var x = Math.min(w - 26, Math.max(0, m[1] / totalDays * w)).toFixed(1);
        s += '<line class="monthline" x1="' + x + '" y1="' + topPad + '" x2="' + x + '" y2="' + (h - axisH) + '"></line>' +
          '<text class="tick" x="' + x + '" y="' + (h - 5) + '">' + m[0] + '</text>';
      });
      s += '</svg>';
      fig.innerHTML = s;
    }
    draw();
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(draw).observe(fig);
  }
})();
