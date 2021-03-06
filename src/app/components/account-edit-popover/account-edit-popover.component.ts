import { ImportAccoutActionContext } from 'airgap-coin-lib/dist/actions/GetKtAccountsAction'
import { Component, OnInit } from '@angular/core'
import { AlertController, NavParams, Platform, PopoverController } from '@ionic/angular'
import { TranslateService } from '@ngx-translate/core'
import { AirGapMarketWallet, getProtocolByIdentifier, ICoinProtocol } from 'airgap-coin-lib'
import { AccountProvider } from '../../services/account/account.provider'
import { ClipboardService } from '../../services/clipboard/clipboard'
import { OperationsProvider } from '../../services/operations/operations'
import { ProtocolSymbols } from '../../services/protocols/protocols'
import { ErrorCategory, handleErrorSentry } from '../../services/sentry-error-handler/sentry-error-handler'
import { ButtonAction } from 'src/app/models/actions/ButtonAction'

declare let cordova

@Component({
  templateUrl: 'account-edit-popover.component.html',
  styleUrls: ['./account-edit-popover.component.scss']
})
export class AccountEditPopoverComponent implements OnInit {
  private readonly wallet: AirGapMarketWallet
  private readonly onDelete: Function
  private readonly onUndelegate: Function
  // Tezos
  public importAccountAction: ButtonAction<string[], ImportAccoutActionContext>
  public isTezosKT: boolean = false
  public isDelegated: boolean = false

  constructor(
    private readonly alertCtrl: AlertController,
    private readonly navParams: NavParams,
    private readonly walletsProvider: AccountProvider,
    private readonly viewCtrl: PopoverController,
    private readonly platform: Platform,
    private readonly clipboardProvider: ClipboardService,
    private readonly translateService: TranslateService,
    private readonly operationsProvider: OperationsProvider
  ) {
    this.wallet = this.navParams.get('wallet')
    this.importAccountAction = this.navParams.get('importAccountAction')
    this.onDelete = this.navParams.get('onDelete')
    this.onUndelegate = this.navParams.get('onUndelegate')
  }

  public async copyAddressToClipboard(): Promise<void> {
    await this.clipboardProvider.copyAndShowToast(this.wallet.receivingPublicAddress)
    await this.dismissPopover()
  }

  public openBlockExplorer(): void {
    const protocol: ICoinProtocol = getProtocolByIdentifier(this.wallet.protocolIdentifier)

    let blockexplorer: string = protocol.blockExplorer
    blockexplorer = protocol.getBlockExplorerLinkForAddress(this.wallet.addresses[0])
    this.openUrl(blockexplorer)
  }
  private openUrl(url: string): void {
    if (this.platform.is('ios') || this.platform.is('android')) {
      cordova.InAppBrowser.open(url, '_system', 'location=true')
    } else {
      window.open(url, '_blank')
    }
  }

  public async ngOnInit(): Promise<void> {
    // tezos
    if (this.wallet.protocolIdentifier === ProtocolSymbols.XTZ_KT) {
      this.isTezosKT = true
    }
    if (this.wallet.protocolIdentifier === ProtocolSymbols.XTZ || this.wallet.protocolIdentifier === ProtocolSymbols.XTZ_KT) {
      this.isDelegated = await this.operationsProvider.getDelegationStatusOfAddress(this.wallet.receivingPublicAddress)
    }
    // tezos end
  }

  public async undelegate(): Promise<void> {
    await this.dismissPopover()
    if (this.onUndelegate) {
      this.onUndelegate()
    } else {
      handleErrorSentry(ErrorCategory.OTHER)('onUndelegate not defined')
    }
  }

  public async delete(): Promise<void> {
    const alert: HTMLIonAlertElement = await this.alertCtrl.create({
      header: this.translateService.instant('account-edit-popover-component.header'),
      message: this.translateService.instant('account-edit-popover-component.message'),
      buttons: [
        {
          text: this.translateService.instant('account-edit-popover-component.cancel'),
          role: 'cancel',
          handler: () => {
            this.dismissPopover()
          }
        },
        {
          text: this.translateService.instant('account-edit-popover-component.delete'),
          handler: () => {
            this.walletsProvider
              .removeWallet(this.wallet)
              .then(() => {
                this.dismissPopover()
                if (this.onDelete) {
                  this.onDelete()
                } else {
                  handleErrorSentry(ErrorCategory.OTHER)('onDelete not defined')
                }
              })
              .catch(handleErrorSentry(ErrorCategory.WALLET_PROVIDER))
          }
        }
      ]
    })
    alert.present().catch(handleErrorSentry(ErrorCategory.IONIC_ALERT))
  }

  public dismissPopover(): Promise<boolean | void> {
    return this.viewCtrl.dismiss().catch(handleErrorSentry(ErrorCategory.NAVIGATION))
  }
}
