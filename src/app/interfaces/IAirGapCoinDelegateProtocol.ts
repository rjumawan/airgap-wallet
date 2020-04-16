import { ICoinDelegateProtocol } from 'airgap-coin-lib'
import { UIWidget } from '../models/widgets/UIWidget'
import { UIInputWidget } from '../models/widgets/UIInputWidget'
import BigNumber from 'bignumber.js'
import { DelegateeDetails, DelegatorDetails } from 'airgap-coin-lib/dist/protocols/ICoinDelegateProtocol'
import { FormGroup } from '@angular/forms'
import { UIRewardList } from '../models/widgets/display/UIRewardList'

export interface AirGapDelegateeUsageDetails {
  usage: BigNumber
  current: BigNumber
  total: BigNumber
}

export interface AirGapMainDelegatorAction {
  type?: any
  isAvailable: boolean
  description?: string
  paramName?: string
  form?: FormGroup
  extraArgs?: UIInputWidget<any>[]
}

export interface AirGapExtraDelegatorAction {
  type: any
  label: string
  confirmLabel: string
  description?: string
  form?: FormGroup
  args?: UIInputWidget<any>[]
}

export interface AirGapDelegateeDetails extends DelegateeDetails {
  usageDetails: AirGapDelegateeUsageDetails
  displayDetails?: UIWidget[]
  extraDetails?: any
}

export interface AirGapDelegatorDetails extends DelegatorDetails {
  delegateAction: AirGapMainDelegatorAction
  undelegateAction: AirGapMainDelegatorAction
  changeDelegateeAction: AirGapMainDelegatorAction
  extraActions?: AirGapExtraDelegatorAction[]
  displayDetails?: UIWidget[]
  displayRewards?: UIRewardList
  extraDetails?: any
}

export interface IAirGapCoinDelegateProtocol extends ICoinDelegateProtocol {
  airGapDelegatee?: string
  delegateeLabel: string

  getExtraDelegateesDetails(addresses: string[]): Promise<Partial<AirGapDelegateeDetails>[]>
  getExtraDelegatorDetailsFromAddress(address: string): Promise<Partial<AirGapDelegatorDetails>>

  onDetailsChange(delegateesDetails: AirGapDelegateeDetails[], delegatorDetails: AirGapDelegatorDetails): Promise<void>
}