# desktop-cctv

- capture displays with one command (useful for multiple screens)
- periodic capture using [pm2](https://pm2.keymetrics.io/)
- Mac Only

## usage

### 1-time capture

```bash
node dist/index.js  # or 'npm start'
```

find out files under `~/Pictures/desktop-cctv/`

```bash
➜  cd ~/Pictures/desktop-cctv
➜  desktop-cctv tree
.
└── 2021
    └── 05
        └── 19
            ├── 08_44_36-Color\ LCD.png
            └── 08_44_37-DELL\ U2717D.png

3 directories, 2 files
```

### Periodic capture (e.g. every 1 min.)

- ensure [pm2 has installed](https://pm2.keymetrics.io/docs/usage/quick-start/#installation)

```bash
pm2 start dist/index.js --name desktop-cctv --cron '0 * * * * *' --no-autorestart
pm2 save
```
