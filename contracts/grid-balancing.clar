;; Grid Balancing Contract

(define-constant CONTRACT_OWNER tx-sender)
(define-constant ERR_NOT_AUTHORIZED (err u401))

(define-map grid-status
  { timestamp: uint }
  { total-production: uint, total-consumption: uint, balance: int }
)

(define-public (update-grid-status (total-production uint) (total-consumption uint))
  (begin
    (asserts! (is-eq tx-sender CONTRACT_OWNER) ERR_NOT_AUTHORIZED)
    (let
      ((balance (- (to-int total-production) (to-int total-consumption))))
      (ok (map-set grid-status
        { timestamp: block-height }
        { total-production: total-production,
          total-consumption: total-consumption,
          balance: balance }
      ))
    )
  )
)

(define-read-only (get-grid-status (timestamp uint))
  (map-get? grid-status { timestamp: timestamp })
)

(define-read-only (get-latest-grid-status)
  (map-get? grid-status { timestamp: (- block-height u1) })
)

